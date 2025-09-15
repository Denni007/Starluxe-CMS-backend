exports.PAYMENT_TYPE = {
    ADVANCE: "advance",
    PAYMENT: "payment",
    FINAL_PAYMENT: "final payment"
}

exports.PERMISSION_ACTIONS = {
    access:"access",
    create:"create",
    view:"view",
    update:"update",
    delete:"delete"
}
exports.CUSTOMERTYPE = {
    DISTRIBUTOR : 'Distributor',
    RETAILER: 'Retailer',
    CHANNEL_PARTNER :'Channel Partner',
    BORWELL : 'Borwell',
    END_USER : 'End User',
  }

exports.PERMISSION_MODULES = {
    Leads:"Leads",
    Opportunities:"Opportunities",
    // Items:"Items",
   // Quotations:"Quotations",
    // Contacts:"Contacts",
    Tasks:"Tasks",
    Reminders:"Reminders",
    // Employee:"Employee",
    Reports:"Reports",
    Settings:"Settings",
    Business:"Business",
    Dashboard:"Dashboard",
    Branches:"Branches",
    Users:"Users",
    Roles:"Roles",
    
    Permissions:"Permissions"
}



exports.ROLE = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    ACCOUNT: "Account",
    EMPLOYEE: "Employee",
    WORKERS: "Workers",
    OTHER: "Other",
    MANAGER: "Manager",
    SALES: "Sales",
    VIEWER: "Viewer",
    USER: "User"
}

exports.SALARY_PAYMENT_TYPE = {
    CASH: "cash",
    BANK: "bank"
}

exports.ACCOUNT_GROUPS_TYPE = {
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

exports.MACHINE_SCHEDULE_TYPE = {
    REGULAR: "Regular",
    PREVENTIVE: "Preventive",
    BREAKDOWN: "Breakdown"
}

exports.MACHINE_SCHEDULE_FREQUENCY= {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly"
}

exports.REGISTRATION_TYPE = {
    COMPOSITION: "Composition",
    REGULAR: "Regular",
    UNREGISTERED: "Unregistered",
}

exports.TRANSACTION_TYPE = {
    BANK: "Bank",
    CASH: "Cash"
}

exports.MAINTENCE_TYPE = {
    OILING: "oiling",
    GREASING: "greasing",
    CLEANING: "cleaning",
    PAINTING: "painting"
}

exports.WORKER_SHIFT = {
    DAY: "Day",
    NIGHT: "Night"
}