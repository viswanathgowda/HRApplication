import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { FirestoreService } from '../../firebase-services/firestore.service';
import { FireAuthService } from '../../firebase-services/fireauth.service';

interface Holiday {
  [key: string]: string; // Allows dynamic date keys with string values (holiday names)
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    TableModule,
    DropdownModule,
    TooltipModule,
    ButtonModule,
    TagModule,
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
})
export class AttendanceComponent implements OnInit {
  today: Date = new Date();
  viewType: string = 'weekly';
  viewMonth: string = 'January';
  viewOptions = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  holidays: Holiday[] = [
    { '26-1-2026': 'Republic Day' }, // Republic Day
    { '15-8-2026': 'Independence Day' }, // Independence Day
    { '2-10-2026': 'Gandhi Jayanti' }, // Gandhi Jayanti
    { '14-4-2026': 'Ambedkar Jayanti' }, // Ambedkar Jayanti
    { '1-5-2026': 'Labour Day' }, // Labour Day
    { '15-8-2026': 'Assam State Day' }, // Assam State Day (Assam)
    { '27-10-2026': 'Dussehra' }, // Dussehra (may vary)
    { '25-12-2026': 'Christmas Day' }, // Christmas Day
    { '14-1-2026': 'Makar Sankranti' }, // Makar Sankranti
    { '26-8-2026': 'Raksha Bandhan' }, // Raksha Bandhan (may vary)
    { '15-2-2026': 'Maha Shivaratri' }, // Maha Shivaratri (may vary)
    { '4-3-2026': 'Holi' }, // Holi (may vary)
    { '8-11-2026': 'Diwali' }, // Diwali (may vary)
    { '29-8-2026': 'Onam' }, // Onam (may vary)
    { '6-1-2026': 'Epiphany' }, // Epiphany
    { '3-4-2026': 'Good Friday' }, // Good Friday
    { '17-6-2026': 'Eid-ul-Adha' }, // Eid-ul-Adha (may vary)
    { '5-4-2026': 'Easter Sunday' }, // Easter Sunday
  ];

  attendance: any[] = [];

  weeklyAttendance: any[] = [];
  monthlyAttendance: any[] = [];
  yearlyAttendance: any[] = [];

  isNextWeekAvl: boolean = false;

  constructor(
    private firestore: FirestoreService,
    private auth: FireAuthService
  ) {}

  ngOnInit(): void {
    this.getAttendance();
    this.fetchYearlyAttendance();
  }

  fetchYearlyAttendance() {
    this.yearlyAttendance = [
      { name: 'January', present: 20, leaves: 2, holidays: 3, offs: 6 },
      { name: 'February', present: 18, leaves: 4, holidays: 2, offs: 4 },
      // Add other months...
    ];
  }

  fetchWeeklyAttendance(
    data: any[] = this.attendance,
    date?: any,
    action?: string
  ) {
    const today =
      action && action?.includes('next')
        ? new Date(new Date(date).setDate(new Date(date).getDate() + 7))
        : action && action.includes('previous')
        ? date
        : new Date();

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return this.formatDate(date);
    });

    const attendanceMap = new Map(data.map((item: any) => [item.docid, item]));

    this.weeklyAttendance = last7Days.map((date) => {
      const record = attendanceMap.get(date);
      const [day, month, year] = date.split('-').map(Number);
      return {
        date: new Date(year, month - 1, day),
        status: this.getAttendanceStatus(date, record),
        signIn: record?.signIn
          ? record.signIn.toDate().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : null,
        signOut: record?.signOut
          ? record.signOut.toDate().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : null,
        signInLocation: record?.signInLocation || null,
        signOutLocation: record?.signOutLocation || null,
      };
    });

    if (this.weeklyAttendance[0].date < new Date()) {
      this.isNextWeekAvl = false;
    } else {
      this.isNextWeekAvl = true;
    }
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Format as `dd-mm-yyyy`
  }

  private getAttendanceStatus(date: string, record?: any): string {
    const today = new Date();
    const attendanceDate = new Date(date.split('-').reverse().join('-'));
    attendanceDate.setHours(0, 0, 0, 0);

    // 1️⃣ Sunday
    if (attendanceDate.getDay() === 0) {
      return 'Off';
    }

    // 2️⃣ Holiday
    const signInDate = record ? this.formatDate(record.signIn.toDate()) : date;

    const holiday = this.holidays.find((h) => h.hasOwnProperty(signInDate));

    if (holiday) {
      return `Holiday: ${holiday[signInDate]}`;
    }
    console.log('Record for date', date, ':', record);
    // 3️⃣ No record
    if (!record?.signIn) {
      // Past date → Absent
      if (attendanceDate < new Date(today.setHours(0, 0, 0, 0))) {
        return 'Absent';
      }
      // Today & before work hours
      if (new Date().getHours() < 9) {
        return '';
      }
      return 'Absent';
    }

    // 4️⃣ Time calculation
    const signInTime: Date = record.signIn.toDate();
    const signOutTime: Date | null = record.signOut
      ? record.signOut.toDate()
      : null;

    const endTime = signOutTime ?? new Date();
    const diffMs = endTime.getTime() - signInTime.getTime();

    const workedHours = diffMs / (1000 * 60 * 60);

    const hours = Math.floor(workedHours);
    const minutes = Math.floor((workedHours - hours) * 60);

    // 5️⃣ Signed in but not signed out
    if (!signOutTime) {
      if (workedHours >= 8) {
        return 'Alert: Sign-out missing';
      }
      return 'Working...';
    }

    // 6️⃣ Final attendance status
    if (workedHours >= 8) {
      const overtime = workedHours - 8;
      return overtime > 0
        ? `Present - Overtime ${overtime.toFixed(2)} hrs`
        : 'Present';
    }

    if (workedHours >= 4) {
      return 'Half-day';
    }

    return 'Absent';
  }

  prepareMonthlyAttendance() {
    const monthIndex = this.months.indexOf(this.viewMonth);
    const selectedMonth: Date = new Date(
      new Date().getFullYear(),
      monthIndex,
      1
    );
    const firstDayOfMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0
    );

    const daysInMonth = [];
    for (
      let date = new Date(firstDayOfMonth);
      date <= lastDayOfMonth;
      date.setDate(date.getDate() + 1)
    ) {
      daysInMonth.push({
        date: new Date(date),
        status: this.getRandomStatus(), // Replace with your real API data
      });
    }

    // Create weeks (rows) for the grid
    const weeks = [];
    let week: { date: Date; status: string }[] = [];
    daysInMonth.forEach((day, index) => {
      if (index % 7 === 0 && week.length) {
        weeks.push(week);
        week = [];
      }
      week.push(day);
    });
    if (week.length) weeks.push(week); // Add the last week

    this.monthlyAttendance = weeks;
  }

  changeView(view: string = 'weekly') {
    if (view === 'weekly') {
      this.fetchWeeklyAttendance(this.attendance);
    } else if (view === 'monthly') {
      this.prepareMonthlyAttendance();
    }
  }

  getRandomStatus(): string {
    const statuses = ['present', 'leave', 'holiday', 'off'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  getAttendance() {
    const month = this.today.getMonth(); // 0 = January, 1 = February, etc.
    const year = this.today.getFullYear();
    const formattedMonth = `${month}-${year}`;
    const day = String(this.today.getDate()).padStart(2, '0');
    const formattedDay = `${day}-${month + 1}-${year}`;
    this.auth.getCurrentUser().then((user) => {
      this.firestore
        .getCollection(`attendance/${formattedMonth}/${user.uid}`)
        .subscribe((att) => {
          // const time = att.signIn.toDate();
          // const signIn = new Date(time).setHours(9, 0, 0, 0);
          // const signOut =
          //   att.signOut?.toDate().getTime() || new Date().setHours(18, 0, 0, 0); // API-provided end time or default to 6 PM
          // this.rangeValues = [signIn, signOut]; // Default to full day
          this.attendance = att;
          this.fetchWeeklyAttendance(this.attendance);
        });
    });
  }
}
