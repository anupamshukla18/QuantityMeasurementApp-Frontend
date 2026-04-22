import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuantityService } from '../../services/quantity.service';
import { AuthService } from '../../services/auth.service';
import { QuantityInputDTO, QuantityMeasurementDTO } from '../../models/quantity.model';

type TabType = 'calculator' | 'history' | 'profile';
type ActionType = 'COMPARE' | 'ADD' | 'CONVERT';

interface HistoryRecord {
  date: string;
  type: string;
  action: string;
  input: string;
  output: string;
  error?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  activeTab: TabType = 'calculator';

  // Unit data matching exactly what the backend enums support
  unitData: Record<string, string[]> = {
    'LENGTHUNIT':      ['FEET', 'INCHES', 'YARDS', 'CENTIMETER'],
    'WEIGHTUNIT':      ['GRAM', 'KILOGRAM', 'TONNE'],
    'TEMPERATUREUNIT': ['CELSIUS', 'FAHRENHEIT'],
    'VOLUMEUNIT':      ['LITER', 'MILLILITER', 'GALLON']
  };

  types = ['Length', 'Weight', 'Temperature', 'Volume'];
  actions: { label: string; value: ActionType }[] = [
    { label: '⚖️ Compare', value: 'COMPARE' },
    { label: '➕ Add',     value: 'ADD' },
    { label: '🔄 Convert', value: 'CONVERT' }
  ];

  currentType = 'LENGTHUNIT';
  currentAction: ActionType = 'COMPARE';
  availableUnits: string[] = [];

  val1 = 0;
  unit1 = '';
  val2 = 0;
  unit2 = '';

  resultDisplay = '';
  errorMessage = '';
  isCalculating = false;

  historyRecords: HistoryRecord[] = [];
  historyLoading = false;
  historyError = '';

  userProfile = {
    name: '',
    email: '',
    role: 'Registered Member',
    joined: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  };

  constructor(
    private quantityService: QuantityService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userProfile.name = this.authService.getUserName() || 'User';
    this.userProfile.email = this.authService.getUserEmail() || '';
    this.setType('Length');
  }

  switchTab(tab: TabType): void {
    this.activeTab = tab;
    if (tab === 'history') this.loadHistory();
  }

  setType(type: string): void {
    this.currentType = type.toUpperCase() + 'UNIT';
    this.availableUnits = this.unitData[this.currentType] || [];
    this.unit1 = this.availableUnits[0];
    this.unit2 = this.availableUnits[1] || this.availableUnits[0];
    this.resultDisplay = '';
    this.errorMessage = '';
  }

  setAction(action: ActionType): void {
    this.currentAction = action;
    this.resultDisplay = '';
    this.errorMessage = '';
  }

  getTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  calculate(): void {
    this.resultDisplay = '';
    this.errorMessage = '';
    this.isCalculating = true;

    // For CONVERT, val2 is irrelevant (we just need the target unit)
    const payload: QuantityInputDTO = {
      thisQuantityDTO: {
        value: this.val1,
        unit: this.unit1,
        measurementType: this.currentType
      },
      thatQuantityDTO: {
        value: this.currentAction === 'CONVERT' ? 0 : this.val2,
        unit: this.unit2,
        measurementType: this.currentType
      }
    };

    let call$ = this.currentAction === 'COMPARE'
      ? this.quantityService.compare(payload)
      : this.currentAction === 'ADD'
        ? this.quantityService.add(payload)
        : this.quantityService.convert(payload);

    call$.subscribe({
      next: (res: QuantityMeasurementDTO) => {
        this.isCalculating = false;

        if (this.currentAction === 'COMPARE') {
          const equal = res.resultString?.toLowerCase() === 'true';
          this.resultDisplay = equal
            ? `✅ Equal — ${this.val1} ${this.unit1} = ${this.val2} ${this.unit2}`
            : `❌ Not Equal — ${this.val1} ${this.unit1} ≠ ${this.val2} ${this.unit2}`;
        } else if (this.currentAction === 'CONVERT') {
          this.resultDisplay = `${this.val1} ${this.unit1} = ${res.resultValue} ${res.resultUnit}`;
        } else {
          this.resultDisplay = `${res.resultValue} ${res.resultUnit}`;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isCalculating = false;
        this.errorMessage = err.error?.message || 'Something went wrong. Check your inputs.';
        this.cdr.detectChanges();
      }
    });
  }

  loadHistory(): void {
    this.historyLoading = true;
    this.historyError = '';
    this.historyRecords = [];

    const operations: ActionType[] = ['COMPARE', 'ADD', 'CONVERT'];
    let completed = 0;
    const all: HistoryRecord[] = [];

    operations.forEach(op => {
      this.quantityService.getHistory(op).subscribe({
        next: (records: QuantityMeasurementDTO[]) => {
          records.forEach(r => {
            all.push({
              date: '—',
              type: (r.thisMeasurementType || '').replace('UNIT', ''),
              action: r.operation?.toUpperCase() || op,
              input: `${r.thisValue} ${r.thisUnit}` + (op !== 'CONVERT' ? ` & ${r.thatValue} ${r.thatUnit}` : ` → ${r.thatUnit}`),
              output: r.error
                ? `Error: ${r.errorMessage}`
                : (op === 'COMPARE' ? r.resultString : `${r.resultValue} ${r.resultUnit}`),
              error: r.error
            });
          });
          completed++;
          if (completed === operations.length) {
            this.historyRecords = all;
            this.historyLoading = false;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          completed++;
          if (completed === operations.length) {
            this.historyLoading = false;
            if (this.historyRecords.length === 0) {
              this.historyError = 'Could not load history from server.';
            }
            this.cdr.detectChanges();
          }
        }
      });
    });
  }

  logout(): void {
    this.authService.logout();
  }

  get avatarLetter(): string {
    return (this.userProfile.name || 'U').charAt(0).toUpperCase();
  }
}
