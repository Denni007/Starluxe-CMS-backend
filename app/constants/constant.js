export const PAYMENT_TYPE = {
    ADVANCE: "advance",
    PAYMENT: "payment",
    FINAL_PAYMENT: "final payment"
}
export const PERMISSION_ACTIONS = ['access', 'create', 'read', 'update', 'delete'];

export const PERMISSION_MODULES = [
  'Leads', 'Opportunities', 'Items', 'Quotations', 'Contacts', 'Tasks',
  'Reminders', 'Employee', 'Reports', 'Settings', 'Business', 'Branches'
];

export const ACTION_LABEL = {
  access: 'Access',
  create: 'Create',
  read: 'Read',
  update: 'Update',
  delete: 'Delete',
};


export const ROLE = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    ACCOUNT: "Account",
    EMPLOYEE: "Employee",
    WORKERS: "Workers",
    OTHER: "Other",
}

export const SALARY_PAYMENT_TYPE = {
    CASH: "cash",
    BANK: "bank"
}

export const ACCOUNT_GROUPS_TYPE = {
    BANK_ACCOUNT: "Bank Account",
    DUTIES_AND_TAXES: "Duties & Taxes",
    EXPENSE_DIRECT: "Expenses (Direct)",
    EXPENSE_INDIRECT: "Expenses (Indirect)",
    INCOME_DIRECT: "Income (Direct)",
    INCOME_INDIRECT: "Income (Indirect)",
    LOAN_AND_ADVANCE: "Loans & Advances (Asset)",
    LOANS: "Loans (Liability)",
    SUNDRY_CREDITORS: "Sundry Creditors",
    SUNDRY_DEBTORS: "Sundry Debtors",
    UNSECURED_LOANS: "Unsecured Loans",
    CASH_IN_HAND: "Cash In Hand",
    EXPENSE: "Expenses (Company)",
    EXPENSE_SELF: "Expenses (self)",
    SALARY: "Salary",
}

export const MACHINE_SCHEDULE_TYPE = {
    REGULAR: "Regular",
    PREVENTIVE: "Preventive",
    BREAKDOWN: "Breakdown"
}

export const MACHINE_SCHEDULE_FREQUENCY= {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly"
}

export const REGISTRATION_TYPE = {
    COMPOSITION: "Composition",
    REGULAR: "Regular",
    UNREGISTERED: "Unregistered",
}

export const TRANSACTION_TYPE = {
    BANK: "Bank",
    CASH: "Cash"
}

export const MAINTENCE_TYPE = {
    OILING: "oiling",
    GREASING: "greasing",
    CLEANING: "cleaning",
    PAINTING: "painting"
}

export const WORKER_SHIFT = {
    DAY: "Day",
    NIGHT: "Night"
}