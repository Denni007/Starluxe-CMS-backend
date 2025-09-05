const {
  email,
  password,
  mobileno,
  challanno,
  date,
  mrp,
  qty,
  voucherno,
  billno,
  billdate,
  payment,
  expensse,
  taxable,
  account,
  paymentdate,
  refno,
  mode,
  amount,
  ProFormaInvoice_no,
  rate,
  validtill,
  creditdate,
  invoiceno,
  invoicedate,
  itemname,
  unit,
  accountname,
  contactpersonname,
  creditperiod,
  address1,
  pincode,
  state,
  city,
  bankdetail,
  creditlimit,
  balance,
  itemtype,
  productname,
  nagativeqty,
  lowstock,
  purchaseprice,
  salesprice,
  terms,
  duedate,
  debitdate,
  depositto,
  receiptdate,
  accountnumber,
  ifsccode,
  bankname,
  username,
  salary,
  role,
  gstnumber,
  HSNcode,
  companyname,
  proFormaNo,
  branch,
  debitnoteno,
  creditnoteNo,
  org_invoiceno,
  org_invoicedate,
  gstrate,
  purpose,
  validateBankdetails,
  validateCredit,
  LoginPassword,
  purchaseinvoicedate,
  create_bom,
  update_itemStock,
  weight,
  itemUnit,
  saleNo,
  purchaseNo,
  paymentNo,
  receiptNo,
  paymentType,
  supplyInvoiceNo,
  dutyTime,
  salaryPaymentType,
  machineName,
  machineNumber,
  machineId,
  cost,
  name,
  itemGroupId,
  itemCategoryId,
  account_validation,
  accountId,
  bankAccountId,
  machine_schedule_validation,
  transactionType,
  purchaseOrder_no,
  saleInvoiceId,
  purchaseDate,
  wastageName,
  maintenance_validation,
} = require("./validation");

module.exports.validation = function (method) {
  switch (method) {
    case "userLogin":
      return [mobileno, LoginPassword];
    case "check_user":
      return [email, mobileno];
    case "create_user":
      return [username, email, mobileno, password, salary, role, dutyTime];
    case "update_user":
      return [email, mobileno, salary, role, dutyTime];
    case "create_deliverychallan":
      return [accountId, saleInvoiceId, challanno, date, qty, itemUnit];
    case "update_deliverychallan":
      return [accountId, saleInvoiceId, challanno, date, qty, itemUnit];
    case "create_ProFormaInvoice":
      return [
        ProFormaInvoice_no,
        accountId,
        terms,
        date,
        validtill,
        qty,
        itemUnit,
        rate,
      ];
    case "update_ProFormaInvoice":
      return [
        ProFormaInvoice_no,
        accountId,
        terms,
        date,
        validtill,
        qty,
        itemUnit,
        rate,
      ];
    case "create_salesinvoice":
      return [
        invoiceno,
        accountId,
        terms,
        invoicedate,
        rate,
        qty,
        proFormaNo,
        itemUnit,
      ];
    case "update_salesinvoice":
      return [
        invoiceno,
        accountId,
        terms,
        invoicedate,
        rate,
        qty,
        proFormaNo,
        itemUnit,
      ];
    case "create_debitNote":
      return [
        accountId,
        debitnoteno,
        purchaseinvoicedate,
        debitdate,
        qty,
        mrp,
        rate,
        itemUnit,
      ];
    case "update_debitNote":
      return [
        accountId,
        debitnoteno,
        purchaseinvoicedate,
        debitdate,
        qty,
        mrp,
        rate,
        itemUnit,
      ];
    case "create_creditNote":
      return [
        accountId,
        creditnoteNo,
        creditdate,
        org_invoiceno,
        org_invoicedate,
        rate,
        qty,
        itemUnit,
      ];
    case "update_creditNote":
      return [
        accountId,
        creditnoteNo,
        creditdate,
        org_invoiceno,
        org_invoicedate,
        rate,
        qty,
        itemUnit,
      ];
    case "create_item":
      return [
        itemtype,
        productname,
        itemGroupId,
        itemCategoryId,
        weight,
        unit,
        nagativeqty,
        gstrate,
        lowstock,
        salesprice,
        HSNcode,
        purchaseprice,
      ];
    case "update_item":
      return [
        itemtype,
        productname,
        itemGroupId,
        itemCategoryId,
        weight,
        unit,
        nagativeqty,
        gstrate,
        lowstock,
        salesprice,
        HSNcode,
        purchaseprice,
      ];
    case "create_purchaseInvoice":
      return [
        accountId,
        duedate,
        voucherno,
        supplyInvoiceNo,
        invoicedate,
        qty,
        itemUnit,
        rate,
      ];
    case "update_purchaseInvoice":
      return [
        accountId,
        duedate,
        voucherno,
        supplyInvoiceNo,
        invoicedate,
        qty,
        itemUnit,
        rate,
      ];
    case "create_company":
      return [
        companyname,
        gstnumber,
        email,
        mobileno,
        address1,
        pincode,
        state,
        city,
      ];
    case "update_company":
      return [
        companyname,
        gstnumber,
        email,
        mobileno,
        address1,
        pincode,
        state,
        city,
      ];
    case "C_create_salesinvoice":
      return [accountId, date, saleNo, qty, itemUnit, rate];
    case "C_update_salesinvoice":
      return [accountId, date, saleNo, qty, itemUnit, rate];
    case "C_create_purchase_Cash":
      return [accountId, date, purchaseNo, qty, itemUnit, rate];
    case "C_update_purchase_Cash":
      return [accountId, date, purchaseNo, qty, itemUnit, rate];
    case "create_receiveCash":
      return [accountId, date, receiptNo, amount];
    case "update_receiveCash":
      return [accountId, date, receiptNo, amount];
    case "create_paymentCash":
      return [accountId, date, paymentNo, amount];
    case "update_paymentCash":
      return [accountId, date, paymentNo, amount];
    case "create_claim":
      return [amount, purpose];
    case "update_claim":
      return [amount, purpose];
    case "create_company_bankDetails":
      return [bankname, accountnumber, ifsccode, branch];
    case "update_company_bankDetails":
      return [bankname, accountnumber, ifsccode, branch];
    case "create_receive_bank":
      return [
        accountId,
        voucherno,
        transactionType,
        paymentdate,
        paymentType,
        amount,
      ];
    case "update_receive_bank":
      return [
        voucherno,
        voucherno,
        transactionType,
        paymentdate,
        paymentType,
        amount,
      ];
    case "create_payment_bank":
      return [
        accountId,
        voucherno,
        transactionType,
        paymentdate,
        paymentType,
        amount,
      ];
    case "update_payment_bank":
      return [
        accountId,
        voucherno,
        transactionType,
        paymentdate,
        paymentType,
        amount,
      ];
    case "create_stoke":
      return [itemname, unit, email];
    case "create_receipt":
      return [voucherno, account, email, mode, refno, depositto, receiptdate];
    case "create_bom":
      return [create_bom];
    case "update_bom":
      return [create_bom];
    case "update_stock":
      return [update_itemStock];
    case "create_raw_material":
      return [
        itemtype,
        productname,
        unit,
        nagativeqty,
        gstrate,
        lowstock,
        salesprice,
        HSNcode,
        purchaseprice,
        weight,
      ];
    case "update_raw_material":
      return [
        itemtype,
        productname,
        unit,
        nagativeqty,
        gstrate,
        lowstock,
        salesprice,
        HSNcode,
        purchaseprice,
        weight,
      ];
    case "add_user_bank_account":
      return [accountname, bankname, accountnumber, ifsccode, branch];
    case "add_salary_payment":
      return [amount, date, salaryPaymentType];
    case "create_machine":
      return [machineName, machineNumber];
    case "create_regular_maintenance":
      return [machineId, date, cost];
    case "create_preventive_maintenance":
      return [machineId, date, cost];
    case "create_breakdown_maintenance":
      return [machineId, date, cost];
    case "create_itemGroup":
      return [name];
    case "create_itemCategory":
      return [name, itemGroupId];
    case "account_validation":
      return [account_validation];
    case "machine_schedule_validation":
      return [machine_schedule_validation];
    case "create_purchaseOrder":
      return [
        purchaseOrder_no,
        accountId,
        terms,
        date,
        validtill,
        qty,
        itemUnit,
        rate,
      ];
    case "update_purchaseOrder":
      return [
        purchaseOrder_no,
        accountId,
        terms,
        date,
        validtill,
        qty,
        itemUnit,
        rate,
      ];
    case "C_create_debitNote":
      return [
        accountId,
        debitnoteno,
        purchaseDate,
        debitdate,
        qty,
        mrp,
        rate,
        itemUnit,
      ];
    case "C_create_creditNote":
      return [accountId, creditnoteNo, creditdate, rate, qty, itemUnit];
    case "wastage_validation":
      return [wastageName];
    case "maintenanceType_validation":
      return [name];
    case "purpose_validation":
      return [name];
    case "maintenance_validation":
      return [maintenance_validation];
    case "create_selfExpense":
      return [date, amount]
    case "update_selfExpense":
      return [date, amount]
    default:
      throw new Error("Invalid validation method");
  }
};
