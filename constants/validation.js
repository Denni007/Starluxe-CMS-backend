const Joi = require("joi");
const {
  PAYMENT_TYPE,
  SALARY_PAYMENT_TYPE,
  ACCOUNT_GROUPS_TYPE,
  REGISTRATION_TYPE,
  MACHINE_SCHEDULE_FREQUENCY,
  MACHINE_SCHEDULE_TYPE,
  TRANSACTION_TYPE,
  MAINTENCE_TYPE,
  WORKER_SHIFT,
} = require("./constant");
const AccountGroup = require("../models/AccountGroup");

exports.email = function (req, res, next) {
  const { email } = req.body;
  const emailSchema = Joi.string()
    .required()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "in"] } })
    .messages({
      "string.base": "Email Must Be A String",
      "string.email": "Invalid Email Format",
      "any.required": "Required field: Email",
      "string.empty": "Email Cannot be Empty",
    });
  const { error } = emailSchema.validate(email);

  if (error) {
    return res.status(400).json({
      status: "False",
      message: error.message,
    });
  }
  next();
};
exports.password = function (req, res, next) {
  const { password } = req.body;

  const passwordSchema = Joi.string()
    .pattern(new RegExp("^[^.]+$"))
    // .pattern(new RegExp('^[^.]*$|.*\.C$'))
    .required()
    .messages({
      "string.empty": "Password Cannot Be Empty",
      "string.pattern.base": "Password cannot contain a dot (.)",
      "any.required": "Required Field: Password",
    });
  const { error } = passwordSchema.validate(password);

  if (error) {
    return res.status(400).json({
      status: "False",
      message: error.message,
    });
  }
  next();
};
exports.LoginPassword = function (req, res, next) {
  const { password } = req.body;

  const passwordSchema = Joi.string()
    // .pattern(new RegExp('^[^.]+$'))
    .pattern(new RegExp("^[^.]*$|.*.C$"))
    .required()
    .messages({
      "string.empty": "Password Cannot Be Empty",
      "any.required": "Required feild : Password",
      "string.pattern.base": "Password must end with '.C'",
    });
  const { error } = passwordSchema.validate(password);

  if (error) {
    return res.status(400).json({
      status: "False",
      message: error.message,
    });
  }
  next();
};

exports.mobileno = function (req, res, next) {
  const { mobileno } = req.body;
  if (mobileno === null || mobileno === undefined || mobileno === "") {
    return res
      .status(400)
      .json({ status: "Fail", message: "Mobile Number Cannot Be Empty" });
  }
  const mobilenoSchema = Joi.number()
    .integer()
    .min(1000000000)
    .max(9999999999)
    .required()
    .messages({
      "number.base": "Moblie Number Must Be A Number",
      "number.min": "Moblie Number Must Have At Least 10 Digits",
      "number.max": "Mobile Number Cannot Have More Then 10 Digits",
      "any.required": "Required Filed: Moblie Number",
    });
  const { error } = mobilenoSchema.validate(mobileno);

  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.challanno = function (req, res, next) {
  const { challanno } = req.body;

  const challannoSchema = Joi.number().required().messages({
    "number.empty": "ChallanNo Cannot Be Empty",
    "any.required": "Required Field : ChallanNo",
    "number.base": "ChallanNo must be a number",
  });
  const valueToValidate = challanno === "" ? undefined : challanno;
  const { error } = challannoSchema.validate(valueToValidate);

  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.date = function (req, res, next) {
  const { date } = req.body;

  const dateSchema = Joi.string().required().messages({
    "string.empty": "Date Cannot Be Empty",
    "any.required": "Required Filed : Date",
    "string.base": "Date Must Be A String",
  });
  const { error } = dateSchema.validate(date);
  if (date === null) {
    return res
      .status(400)
      .json({ status: "False", message: "Date Cannot Be Empty" });
  }
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};

exports.mrp = function (req, res, next) {
  const { items } = req.body;

  for (const item of items) {
    const { mrp } = item;
    const mrpSchema = Joi.number()

      .required()
      .messages({
        "number.empty": "MRP Cannot Be Empty",
        "any.required": "Required Filed : MRP",
        "number.base": "Mrp must be a number",
      });
    const valueToValidate = mrp === "" ? undefined : mrp;
    const { error } = mrpSchema.validate(valueToValidate);
    if (error) {
      return res.status(400).json({ status: "False", message: error.message });
    }
  }
  next();
};
exports.qty = function (req, res, next) {
  const { items } = req.body;
  for (const item of items) {
    const { qty } = item;
    const qtySchema = Joi.number().required().messages({
      "any.required": "Required Filed : QTY",
      "number.empty": "QTY Cannot Be Empty",
      "number.base": "Qty must be a number",
    });
    const valueToValidate = qty === "" ? undefined : qty;
    const { error } = qtySchema.validate(valueToValidate);
    if (error) {
      return res.status(400).json({ status: "False", message: error.message });
    }
  }
  next();
};
exports.productId = function (req, res, next) {
  const { items } = req.body;

  for (const item of items) {
    const { productId } = item;
    const productSchema = Joi.number().required().messages({
      "any.required": "Required Filed : Product",
      "number.empty": "Product Cannot Be Empty",
    });

    const { error } = productSchema.validate(productId);

    if (error) {
      return res.status(400).json({ status: "False", message: error.message });
    }
  }
  next();
};
exports.description = function (req, res, next) {
  const { description } = req.body;
  const descriptionSchema = Joi.string().allow(null).messages({
    "string.base": "Description Must be String",
    "string.empty": "Description can not be empty",
  });
  const { error } = descriptionSchema.validate(description);

  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.batchno = function (req, res, next) {
  const { items } = req.body;
  for (const item of items) {
    const { batchno } = item;
    const batchnoSchema = Joi.string()

      .required()
      .messages({
        "any.required": "Required Filed : Batchno",
        "string.empty": "Batchno Cannot Be Empty",
      });
    const { error } = batchnoSchema.validate(batchno);

    if (error) {
      return res.status(400).json({ status: "False", message: error.message });
    }
  }
  next();
};
exports.quotationno = function (req, res, next) {
  const { items } = req.body;
  for (const item of items) {
    const { quotationno } = item;
    const quotationnoSchema = Joi.string()

      .required()
      .messages({
        "any.required": "Required Filed : Quotation Number",
        "string.empty": "Quotation Number Cannot Be Empty",
      });
    const { error } = quotationnoSchema.validate(quotationno);

    if (error) {
      return res.status(400).json({ status: "False", message: error.message });
    }
  }
  next();
};
exports.expirydate = function (req, res, next) {
  const { items } = req.body;
  for (const item of items) {
    const { expirydate } = item;
    const expirydateSchema = Joi.string()

      .required()
      .messages({
        "any.required": "Required Filed : Expiry Date",
        "string.empty": "Expiry Date Cannot Be Empty",
      });
    const { error } = expirydateSchema.validate(expirydate);

    if (error) {
      return res.status(400).json({ status: "False", message: error.message });
    }
  }
  next();
};

exports.voucherno = function (req, res, next) {
  const { voucherno } = req.body;
  const vouchernoSchema = Joi.number().required().messages({
    "any.required": "Required Filed : Voucher No",
    "number.empty": "Voucher No Cannot Be Empty",
    "number.base": "Voucher must be a number",
  });
  const valueToValidate = voucherno === "" ? undefined : voucherno;
  const { error } = vouchernoSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.gstrate = function (req, res, next) {
  const { gstrate } = req.body;
  const gstrateSchema = Joi.number().required().messages({
    "any.required": "Required Filed : GST Rate",
    "number.empty": "GST Rate Cannot Be Empty",
  });
  const valueToValidate = gstrate === "" ? undefined : gstrate;
  const { error } = gstrateSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }

  next();
};
exports.billno = function (req, res, next) {
  const { billno } = req.body;
  const billnoSchema = Joi.string().required().messages({
    "any.required": "Required Field: Bill No.",
    "string.empty": "Bill No. Cannot Be Empty",
  });
  const { error } = billnoSchema.validate(billno);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.billdate = function (req, res, next) {
  const { billdate } = req.body;
  const billdateSchema = Joi.string().required().messages({
    "any.required": "Required Filed : Bill Date",
    "string.empty": "Bill Date Cannot Be Empty",
  });
  const { error } = billdateSchema.validate(billdate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.payment = function (req, res, next) {
  const { payment } = req.body;
  const paymentSchema = Joi.string().required().messages({
    "any.required": "Required Filed : Payment",
    "string.empty": "Payment Cannot Be Empty",
  });
  const { error } = paymentSchema.validate(payment);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.expensse = function (req, res, next) {
  const { items } = req.body;

  for (const item of items) {
    const { expensse } = item;

    const expensseSchema = Joi.string()

      .required()
      .messages({
        "any.required": "Required Field: Expensse",
        "string.empty": "Expensse Cannot Be Empty",
      });
    const { error } = expensseSchema.validate(expensse);
    if (error) {
      return res.status(400).json({ status: "False", message: error.message });
    }
  }
  next();
};
exports.taxable = function (req, res, next) {
  const { items } = req.body;

  for (const item of items) {
    const { taxable } = item;

    const taxableSchema = Joi.number().required().messages({
      "any.required": "Required Field : TaxAble",
      "string.empty": "TaxAble Cannot Be Empty",
      "number.base": "TaxAble must be a number",
    });
    const valueToValidate = taxable === "" ? undefined : taxable;
    const { error } = taxableSchema.validate(valueToValidate);
    if (error) {
      return res.status(400).json({ status: "False", message: error.message });
    }
  }
  next();
};
exports.account = function (req, res, next) {
  const { account } = req.body;

  const accountSchema = Joi.string().required().messages({
    "any.required": "Required Field : Account",
    "string.empty": "Account Cannot Be Empty",
  });
  const { error } = accountSchema.validate(account);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.paymentdate = function (req, res, next) {
  const { paymentdate } = req.body;

  const paymentdateSchema = Joi.string().required().messages({
    "any.required": "Required Field : Payment Date",
    "string.empty": "Payment Date Cannot Be Empty",
  });
  const { error } = paymentdateSchema.validate(paymentdate);
  if (paymentdate === null) {
    return res
      .status(400)
      .json({ status: "False", message: "Payment Date Cannot Be Empty" });
  }
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.mode = function (req, res, next) {
  const { mode } = req.body;
  const modeSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Filed : Mode",
      "string.empty": "Mode Cannot Be Empty",
    });
  const { error } = modeSchema.validate(mode);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.refno = function (req, res, next) {
  const { refno } = req.body;
  const refnoSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Filed : Ref Number",
      "string.empty": "Ref Number Cannot Be Empty",
    });
  const { error } = refnoSchema.validate(refno);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.amount = function (req, res, next) {
  const { amount } = req.body;
  const amountSchema = Joi.number().min(1).required().messages({
    "any.required": "Required Field : Amount",
    "number.empty": "Amount Cannot Be Empty",
    "number.min": "Please Enter Valid Amount",
  });
  const valueToValidate = amount === "" ? undefined : amount;
  const { error } = amountSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.paidfrom = function (req, res, next) {
  const { paidfrom } = req.body;
  const paidfromSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : PaidFrom",
      "string.empty": "PaidFrom Cannot Be Empty",
    });
  const { error } = paidfromSchema.validate(paidfrom);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.quotationref = function (req, res, next) {
  const { quotationref } = req.body;
  const quotationrefSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Quotation Ref",
      "string.empty": "Quotation Ref Cannot Be Empty",
    });
  const { error } = quotationrefSchema.validate(quotationref);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.pono = function (req, res, next) {
  const { pono } = req.body;

  const ponoSchema = Joi.string().required().messages({
    "any.required": "Required Field : Pono",
    "string.empty": "Pono Cannot Be Empty",
  });
  const { error } = ponoSchema.validate(pono);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.ProFormaInvoice_no = function (req, res, next) {
  const { ProFormaInvoice_no } = req.body;
  const pattern = /^Q-\d+$/;

  const ProFormaInvoice_noSchema = Joi.string()
    .required()
    .pattern(pattern)
    .messages({
      "any.required": "Required Field : ProForma Invoice Number",
      "string.empty": "ProForma Invoice_No Cannot Be Empty",
      "string.pattern.base":
        "ProForma Invoice Number must start with 'Q' followed by a dash and then a number",
    });
  const { error } = ProFormaInvoice_noSchema.validate(ProFormaInvoice_no);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.rate = function (req, res, next) {
  const { items } = req.body;
  for (const item of items) {
    const { rate } = item;

    const rateSchema = Joi.number().required().messages({
      "any.required": "Required Field : Rate",
      "number.empty": "Rate Cannot Be Empty",
      "number.base": "Rate must be a number",
    });
    const valueToValidate = rate === "" ? undefined : rate;
    const { error } = rateSchema.validate(valueToValidate);
    if (error) {
      return res.status(400).json({ status: "False", message: error.message });
    }
  }
  next();
};
exports.discount = function (req, res, next) {
  const { items } = req.body;
  for (const item of items) {
    const { discount } = item;
    const discountSchema = Joi.string()

      .required()
      .messages({
        "any.required": "Required Field : Discount",
        "string.empty": "Discount Cannot Be Empty",
      });
    const { error } = discountSchema.validate(discount);
    if (error) {
      return res.status(400).json({ status: "False", message: error.message });
    }
  }
  next();
};
exports.validtill = function (req, res, next) {
  const { validtill } = req.body;
  const validtillSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Validtill",
      "string.empty": "Validtill Date Cannot Be Empty",
      "string.base": "Validtill Date Must Be A String",
    });
  const { error } = validtillSchema.validate(validtill);
  if (validtill === null) {
    return res
      .status(400)
      .json({ status: "False", message: "Validtill Date Cannot Be Empty" });
  }
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.creditnoteNo = function (req, res, next) {
  const { creditnoteNo } = req.body;
  const creditnoteNoSchema = Joi.number()

    .required()
    .messages({
      "number.base": "Credit Note must be a number",
      "any.required": "Required Field : Credit Note",
      "number.empty": "Credit Note Cannot Be Empty",
    });
  const valueToValidate = creditnoteNo === "" ? undefined : creditnoteNo;
  const { error } = creditnoteNoSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.creditdate = function (req, res, next) {
  const { creditdate } = req.body;
  const creditdateSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Credit Date",
      "string.empty": "Credit Date Cannot Be Empty",
    });
  const { error } = creditdateSchema.validate(creditdate);
  if (creditdate === null) {
    return res
      .status(400)
      .json({ status: "False", message: "Creadit Date Cannot Be Empty" });
  }
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.invoiceno = function (req, res, next) {
  const { invoiceno } = req.body;
  const invoicenoSchema = Joi.number().required().messages({
    "number.base": "Invoice Number must be a number",
    "any.required": "Required Field : Invoice Number",
    "number.empty": "Invoice Number Cannot Be Empty",
  });
  const valueToValidate = invoiceno === "" ? undefined : invoiceno;
  const { error } = invoicenoSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.invoicedate = function (req, res, next) {
  const { invoicedate } = req.body;
  const invoicedateSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Invoice Date",
      "string.empty": "Invoice Date Cannot Be Empty",
      "string.base": "Invoice Date Must Be A String",
    });
  const { error } = invoicedateSchema.validate(invoicedate);
  if (invoicedate === null) {
    return res
      .status(400)
      .json({ status: "False", message: "Invoice Date Cannot Be Empty" });
  }
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.purchaseinvoicedate = function (req, res, next) {
  const { invoicedate } = req.body;
  const invoicedateSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field :Purchase Invoice Date",
      "string.empty": "Purchase Invoice Date Cannot Be Empty",
      "string.base": "Purchase Invoice Date Must Be A String",
    });
  const { error } = invoicedateSchema.validate(invoicedate);
  if (invoicedate === null) {
    return res
      .status(400)
      .json({ status: "False", message: "Purchase Invoice Cannot Be Empty" });
  }
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.itemname = function (req, res, next) {
  const { itemname } = req.body;
  const itemnameSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Item Name",
      "string.empty": "Item Name Cannot Be Empty",
    });
  const { error } = itemnameSchema.validate(itemname);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.unit = function (req, res, next) {
  const { unit } = req.body;
  const unitSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Unit",
      "string.empty": "Unit Cannot Be Empty",
      "string.base": " Unit Value Must be String",
    });
  const { error } = unitSchema.validate(unit);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.accountname = function (req, res, next) {
  const { accountname } = req.body;
  const accountnameSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Account Name",
      "string.empty": "Account Name Cannot Be Empty",
    });
  const { error } = accountnameSchema.validate(accountname);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.shortname = function (req, res, next) {
  const { shortname } = req.body;
  const shortnameSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Short Name",
      "string.empty": "Short Name Cannot Be Empty",
    });
  const { error } = shortnameSchema.validate(shortname);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.contactpersonname = function (req, res, next) {
  const { contactpersonname } = req.body;
  const contactpersonnameSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Contact Person Name",
      "string.empty": "ContactPerson Name Cannot Be Empty",
    });
  const { error } = contactpersonnameSchema.validate(contactpersonname);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.creditperiod = function (req, res, next) {
  const { creditperiod } = req.body;
  const creditperiodSchema = Joi.number()

    .required()
    .messages({
      "any.required": "Required Field : Default Credit Period",
      "number.base": "Default Credit Period must be a number",
      "number.empty": "Default Credit Period Cannot Be Empty",
    });
  // const { error } = creditperiodSchema.validate(creditperiod);
  const valueToValidate = creditperiod === "" ? undefined : creditperiod;

  const { error } = creditperiodSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.address1 = function (req, res, next) {
  const { address1 } = req.body;
  const address1Schema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : address1",
      "string.empty": "address1 Cannot Be Empty",
    });
  const { error } = address1Schema.validate(address1);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.pincode = function (req, res, next) {
  const { pincode } = req.body;
  const pincodeSchema = Joi.number()

    .required()
    .min(100000)
    .max(999999)
    .messages({
      "number.base": "PinCode Must Be A Number",
      "any.required": "Required Field : PinCode",
      "number.empty": "PinCode Cannot Be Empty",
      "number.min": "Pincode Must Be At Least 6 Digits",
      "number.max": "Pincode Must Be At Most 6 Digits",
    });
  const valueToValidate = pincode === "" ? undefined : pincode;
  const { error } = pincodeSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.state = function (req, res, next) {
  const { state } = req.body;
  const stateSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : state",
      "string.empty": "state Cannot Be Empty",
    });
  const { error } = stateSchema.validate(state);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.city = function (req, res, next) {
  const { city } = req.body;
  const citySchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : City",
      "string.empty": "City Cannot Be Empty",
    });
  const { error } = citySchema.validate(city);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.bankdetail = function (req, res, next) {
  const { bankdetail } = req.body;
  const bankdetailSchema = Joi.boolean()

    .required()
    .messages({
      "any.required": "Required Field : Bank Detail",
      "boolean.empty": "Bank Detail Cannot Be Empty",
    });
  const { error } = bankdetailSchema.validate(bankdetail);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.creditlimit = function (req, res, next) {
  const { creditlimit } = req.body;
  const creditlimitSchema = Joi.boolean()

    .required()
    .messages({
      "any.required": "Required Feild : Credit Limit",
      "boolean.empty": "Credit Limit Cannot Be Empty",
    });
  const { error } = creditlimitSchema.validate(creditlimit);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.balance = function (req, res, next) {
  const { balance } = req.body;
  const balanceSchema = Joi.number()

    .required()
    .messages({
      "any.required": "Required Field : Balance",
      "number.empty": "Balance Cannot Be Empty",
      "number.base": "Balance must be a number",
    });
  const valueToValidate = balance === "" ? undefined : balance;
  const { error } = balanceSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.itemtype = function (req, res, next) {
  const { itemtype } = req.body;
  const itemtypeSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Itemtype",
      "string.empty": "Itemtype Cannot Be Empty",
    });
  const { error } = itemtypeSchema.validate(itemtype);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.productname = function (req, res, next) {
  const { productname } = req.body;
  const productnameSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Product Name",
      "string.empty": "Product Name Cannot Be Empty",
    });
  const { error } = productnameSchema.validate(productname);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.nagativeqty = function (req, res, next) {
  const { nagativeqty } = req.body;
  const nagativeqtySchema = Joi.boolean()

    .required()
    .messages({
      "any.required": "Required Field : Nagative Qty",
      "boolean.empty": "Nagative Qty Cannot Be Empty",
    });
  const { error } = nagativeqtySchema.validate(nagativeqty);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.lowstock = function (req, res, next) {
  const { lowstock, lowStockQty } = req.body;
  const schema = Joi.object({
    lowstock: Joi.boolean().required().messages({
      "any.required": "Required Field : lowStock",
      "boolean.empty": "lowStock Cannot Be Empty",
    }),
    lowStockQty: Joi.when("lowstock", {
      is: true,
      then: Joi.number().greater(0).required().messages({
        "number.base": "lowStockQty must be a number when lowstock is true",
        "number.greater":
          "lowStockQty must be greater than 0 when lowstock is true",
        "any.required": "Required Field : lowStockQty when lowstock is true",
      }),
      otherwise: Joi.valid(null).required().messages({
        "any.only": "lowStockQty must be null when lowstock is false",
        "any.required": "Required Field : lowStockQty when lowstock is false",
      }),
    }),
  });

  const { error } = schema.validate({ lowstock, lowStockQty });
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.purchaseprice = function (req, res, next) {
  const { purchaseprice } = req.body;
  const purchasepriceSchema = Joi.number().allow(null).required().messages({
    "any.required": "Required Field :Purchase Price",
    "number.empty": "Purchase price Cannot Be Empty",
    "number.base": "Purchase Price must be a number",
  });
  const valueToValidate = purchaseprice === "" ? undefined : purchaseprice;
  const { error } = purchasepriceSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.salesprice = function (req, res, next) {
  const { salesprice } = req.body;
  const salespriceSchema = Joi.number().greater(0).required().messages({
    "any.required": "Required Field : Sales Price",
    "number.empty": "Sales Price Cannot Be Empty",
    "number.base": "Sales Price must be a number",
    "number.greater": "Sales Price must be greater than 0.",
  });
  const valueToValidate = salesprice === "" ? undefined : salesprice;
  const { error } = salespriceSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.purchaseprice = function (req, res, next) {
  const { purchaseprice } = req.body;
  const purchasepriceSchema = Joi.number()
  .messages({
    "number.base": "Purchase Price must be a number",
  });
  const valueToValidate = purchaseprice === "" ? undefined : purchaseprice;
  const { error } = purchasepriceSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.group = function (req, res, next) {
  const { group } = req.body;
  const groupSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Group",
      "string.empty": "Group Cannot Be Empty",
    });
  const { error } = groupSchema.validate(group);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.remarks = function (req, res, next) {
  const { remarks } = req.body;
  const remarksSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Remarks",
      "string.empty": "Remarks Cannot Be Empty",
    });
  const { error } = remarksSchema.validate(remarks);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.category = function (req, res, next) {
  const { category } = req.body;
  const categorySchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Category",
      "string.empty": "Category Cannot Be Empty",
    });
  const { error } = categorySchema.validate(category);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.unitname = function (req, res, next) {
  const { unitname } = req.body;
  const unitnameSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Unitname",
      "string.empty": "Unitname Cannot Be Empty",
    });
  const { error } = unitnameSchema.validate(unitname);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.terms = function (req, res, next) {
  const { terms } = req.body;
  const termsSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : terms",
      "string.empty": "terms Cannot Be Empty",
    });
  const { error } = termsSchema.validate(terms);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.duedate = function (req, res, next) {
  const { duedate } = req.body;
  const duedateSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : duedate",
      "string.empty": "Duedate Cannot Be Empty",
      "string.base": "Date Must Be A String",
    });
  const { error } = duedateSchema.validate(duedate);
  if (duedate === null) {
    return res
      .status(400)
      .json({ status: "False", message: "Duedate Cannot Be Empty" });
  }
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.book = function (req, res, next) {
  const { book } = req.body;
  const bookSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Field : Book",
      "string.empty": "Book Cannot Be Empty",
    });
  const { error } = bookSchema.validate(book);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.debitnoteno = function (req, res, next) {
  const { debitnoteno } = req.body;
  const debitnotenoSchema = Joi.number().required().messages({
    "any.required": "Required Field : Debit Note Number",
    "number.empty": "Debit Note Cannot Be Empty",
    "number.base": "Debit Note must be a number",
  });
  const valueToValidate = debitnoteno === "" ? undefined : debitnoteno;
  const { error } = debitnotenoSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.debitdate = function (req, res, next) {
  const { debitdate } = req.body;
  const debitdateSchema = Joi.string().required().messages({
    "any.required": "Required Field : Debit Date",
    "string.empty": "Debit Date Cannot Be Empty",
  });
  const { error } = debitdateSchema.validate(debitdate);
  if (debitdate === null) {
    return res
      .status(400)
      .json({ status: "False", message: "Debit Date Cannot Be Empty" });
  }
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.refdate = function (req, res, next) {
  const { refdate } = req.body;
  const refdateSchema = Joi.string().required().messages({
    "any.required": "Required Field : RefDate",
    "string.empty": "RefDate Cannot Be Empty",
  });
  const { error } = refdateSchema.validate(refdate);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.price = function (req, res, next) {
  const { items } = req.body;
  for (const item of items) {
    const { price } = item;
    const priceSchema = Joi.number().required().messages({
      "any.required": "Required Field : Price",
      "number.empty": "Price Cannot Be Empty",
      "number.base": "Price must be a number",
    });
    const valueToValidate = price === "" ? undefined : price;
    const { error } = priceSchema.validate(valueToValidate);
    if (error) {
      return res.status(400).json({ status: "False", message: error.message });
    }
  }
  next();
};
exports.bill_no = function (req, res, next) {
  const { items } = req.body;

  for (const item of items) {
    const { bill_no } = item;

    const bill_noSchema = Joi.string()

      .required()
      .messages({
        "any.required": "Required Field: bill_no",
        "string.empty": "bill_no Cannot Be Empty",
      });
    const { error } = bill_noSchema.validate(bill_no);
    if (error) {
      return res.status(400).json({ status: "False", message: error.message });
    }
  }
  next();
};
exports.bill_date = function (req, res, next) {
  const { items } = req.body;

  for (const item of items) {
    const { bill_date } = item;

    const bill_dateSchema = Joi.string()

      .required()
      .messages({
        "any.required": "Required Field: Bill_date",
        "string.empty": "bill_date Cannot Be Empty",
      });
    const { error } = bill_dateSchema.validate(bill_date);
    if (error) {
      return res.status(400).json({ status: "False", message: error.message });
    }
  }
  next();
};
exports.receiptdate = function (req, res, next) {
  const { receiptdate } = req.body;
  const receiptdateSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required Filed: Receipt Date",
      "string.empty": "Receipt Date Cannot Be Empty",
    });
  const { error } = receiptdateSchema.validate(receiptdate);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.depositto = function (req, res, next) {
  const { depositto } = req.body;
  const deposittoSchema = Joi.string().required().messages({
    "any.required": "Required Filed : Deposit To",
    "string.empty": "Deposit To Cannot Be Empty",
  });
  const { error } = deposittoSchema.validate(depositto);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
// exports.amountreceive = function (req, res, next) {
//   const { amountreceive } = req.body;
//   const amountreceiveSchema = Joi.number().required().messages({
//     "any.required": "Required filed : Amount Receive",
//     "number.empty": "Amount Receive Cannot Be Empty",
//     "number.base": "Amount Receive must be a number",
//   });

//   const { error } = amountreceiveSchema.validate(amountreceive);
//   if (error) {
//     return res.status(400).json({ status: "false", message: error.message });
//   }
//   next();
// };
exports.accountnumber = function (req, res, next) {
  const { accountnumber } = req.body;
  const accountnumberSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required filed : Account Number",
      "string.empty": "Account Number Cannot Be Empty",
    });
  const { error } = accountnumberSchema.validate(accountnumber);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.ifsccode = function (req, res, next) {
  const { ifsccode } = req.body;
  const ifsccodeSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required filed : IFSC Code",
      "string.empty": "IFSC Code Cannot Be Empty",
    });
  const { error } = ifsccodeSchema.validate(ifsccode);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.bankname = function (req, res, next) {
  const { bankname } = req.body;
  const banknameSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required filed : BankName",
      "string.empty": "BankName Cannot Be Empty",
    });
  const { error } = banknameSchema.validate(bankname);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.branch = function (req, res, next) {
  const { branch } = req.body;

  const branchSchema = Joi.string().required().messages({
    "any.required": "Required Feild: Branch",
    "string.empty": "Branch Name Cannot Be Empty",
  });
  const { error } = branchSchema.validate(branch);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.country = function (req, res, next) {
  const { country } = req.body;
  const countrySchema = Joi.string().required().messages({
    "any.required": "Required filed : Country",
    "string.empty": "Country Cannot Be Empty",
  });
  const { error } = countrySchema.validate(country);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.username = function (req, res, next) {
  const { username } = req.body;
  const usernameSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required filed : User Name",
      "string.empty": "User Name Cannot Be Empty",
    });
  const { error } = usernameSchema.validate(username);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.salary = function (req, res, next) {
  const { salary } = req.body;
  const salarySchema = Joi.number()

    .required()
    .messages({
      "any.required": "Required filed : Salary",
      "string.empty": "Salary Cannot Be Empty",
      "number.base": "Salary must be a number",
    });
  const valueToValidate = salary === "" ? undefined : salary;
  const { error } = salarySchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.role = function (req, res, next) {
  const { role } = req.body;
  const roleSchema = Joi.string()

    .required()
    .messages({
      "any.required": "Required field : Role",
      "string.empty": "Role Cannot Be Empty",
    });
  const { error } = roleSchema.validate(role);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.gstnumber = function (req, res, next) {
  const { gstnumber } = req.body;
  const gstnumberSchema = Joi.string()

    .length(15)
    .required()
    .messages({
      "any.required": " Required field : GST Number",
      "string.empty": "GST Number Cannot Be Empty",
      "string.length": "GST Number must be exactly 15 characters long",
    });
  const { error } = gstnumberSchema.validate(gstnumber);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.HSNcode = function (req, res, next) {
  const { HSNcode } = req.body;

  const HSNcodeSchema = Joi.number()
    .integer()
    .required()
    .custom((value, helpers) => {
      const length = value.toString().length;
      if (length !== 4 && length !== 6 && length !== 8) {
        return helpers.message("HSN Code must be 4, 6, or 8 digits");
      }
      return value;
    })
    .messages({
      "any.required": "Required Field: HSN Code",
      "number.base": "HSN Code must be a number",
      "number.empty": "HSN Code cannot be empty",
    });
  const valueToValidate = HSNcode === "" ? undefined : HSNcode;
  const { error } = HSNcodeSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.companyname = function (req, res, next) {
  const { companyname } = req.body;

  const companynameSchema = Joi.string().required().messages({
    "any.required": "Required field : Company Name",
    "string.empty": "Company Cannot Be Empty",
  });

  const { error } = companynameSchema.validate(companyname);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.org_invoiceno = function (req, res, next) {
  const { org_invoiceno } = req.body;

  const org_invoicenoSchema = Joi.number().required().messages({
    "number.base": "Org. Invoice Number must be a number",
    "any.required": "Required feild: Org. Invoice Number",
    "number.empty": "Org. Invoice Number Cannot Be Empty",
  });
  const valueToValidate = org_invoiceno === "" ? undefined : org_invoiceno;
  const { error } = org_invoicenoSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.org_invoicedate = function (req, res, next) {
  const { org_invoicedate } = req.body;

  const org_invoicedateSchema = Joi.string().required().messages({
    "string.empty": "Org. Invoice Date Cannot Be Empty",
    "any.required": "Required Filed : Org. Invoice Date",
  });
  const { error } = org_invoicedateSchema.validate(org_invoicedate);
  if (org_invoicedate === null) {
    return res
      .status(400)
      .json({ status: "False", message: "Org Invoice Date Cannot Be Empty" });
  }
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};
exports.referance = function (req, res, next) {
  const { referance } = req.body;

  const referanceSchema = Joi.string().required().messages({
    "any.required": "Required field : Referance",
    "string.empty": "Referance Cannot Be Empty",
  });

  const { error } = referanceSchema.validate(referance);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.purpose = function (req, res, next) {
  const { purposeId } = req.body;

  const purposeSchema = Joi.number().required().messages({
    "any.required": "Required field : Purpose",
    "number.base": "Purpose must be a number",
    "number.empty": "Purpose Cannot Be Empty",
  });

  const { error } = purposeSchema.validate(purposeId);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};
exports.validateBankdetails = function (req, res, next) {
  const { bankdetail, bankdetails } = req.body;

  if (bankdetail === true) {
    const bankdetailsSchema = Joi.object({
      bankname: Joi.string().required().messages({
        "any.required": "Required field : Bank name",
        "string.empty": "Bank name cannot be empty",
      }),
      ifsccode: Joi.string().required().messages({
        "any.required": "Required field : IFSC code",
        "string.empty": "IFSC code cannot be empty",
      }),
      accounttype: Joi.string().required().messages({
        "any.required": "Required field : Account type",
        "string.empty": "Account type cannot be empty",
      }),
      accountnumber: Joi.string().required().messages({
        "any.required": "Required field : Account number",
        "string.empty": "Account number cannot be empty",
      }),
    });

    const { error } = bankdetailsSchema.validate(bankdetails);
    if (error) {
      return res
        .status(400)
        .json({ status: "false", message: error.details[0].message });
    }
  }
  next();
};
exports.validateCredit = function (req, res, next) {
  const { creditlimit, totalcreadit } = req.body;

  if (creditlimit === true) {
    const schema = Joi.object({
      totalcreadit: Joi.number().required().messages({
        "any.required": "Required field: totalcreadit",
        "number.base": "totalcreadit must be a number",
      }),
    });

    const { error } = schema.validate({ totalcreadit });

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  }

  next();
};

exports.weight = function (req, res, next) {
  const { weight } = req.body;
  const weightSchema = Joi.number().greater(0).allow(null).messages({
    "number.base": "The weight must be a number.",
    "number.greater": "Weight must be greater than 0.",
  });
  const valueToValidate = weight === "" ? undefined : weight;
  const { error } = weightSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({
      status: "false",
      message: error.message,
    });
  } else {
    next();
  }
};

exports.create_bom = function (req, res, next) {
  const payload = req.body;

  const schema = Joi.object({
    bomNo: Joi.number().required().messages({
      "any.required": "The bomNo field is required.",
      "number.base": "The bomNo must be a number.",
    }),
    date: Joi.date().required().messages({
      "any.required": "The date field is required.",
      "date.base": "The date must be a valid date.",
    }),
    weight: Joi.number().greater(0).required().messages({
      "any.required": "The weight field is required.",
      "number.base": "The weight must be a number.",
      "number.greater": "Weight must be greater than 0.",
    }),
    productId: Joi.number().required().messages({
      "any.required": "The productId field is required.",
      "number.base": "The productId must be a number.",
    }),
    qty: Joi.number().greater(0).required().messages({
      "any.required": "The qty field is required.",
      "number.base": "The qty must be a number.",
      "number.greater": "Qty must be greater than 0.",
    }),
    totalQty: Joi.number().greater(0).required().messages({
      "any.required": "Total Qty field is required.",
      "number.base": "Total Qty must be a number.",
      "number.greater": "Total Qty must be greater than 0.",
    }),
    unit: Joi.string().required().messages({
      "any.required": "The product unit field is required.",
      "string.base": "The product unit must be a string.",
      "string.empty": "The product unit cannot be empty.",
    }),
    shift: Joi.string()
      .valid(...Object.values(WORKER_SHIFT))
      .required()
      .messages({
        "string.base": "Shift must be a string",
        "any.only": `Shift must be one of ${Object.values(WORKER_SHIFT).join(
          ", "
        )}`,
        "any.required": "Shift is required",
      }),
    startTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
      .required()
      .messages({
        "string.pattern.base":
          "Start Time must be in the format HH:mm (24-hour format)",
        "any.required": "Start time is required",
      }),
    endTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
      .required()
      .messages({
        "string.pattern.base":
          "Start time must be in the format HH:mm (24-hour format)",
        "any.required": "Start time is required",
      }),
    wastageId: Joi.number().required().messages({
      "any.required": "The Wastage field is required.",
      "number.base": "The Wastage must be a number.",
    }),
    wastageQty: Joi.number().greater(0).required().messages({
      "any.required": "The Wastage qty field is required.",
      "number.base": "The Wastage qty must be a number.",
      "number.greater": "Wastage Qty must be greater than 0.",
    }),
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.number().required().messages({
            "any.required": "The productId field is required.",
            "number.base": "The productId must be a number.",
          }),
          qty: Joi.number().greater(0).required().messages({
            "any.required": "The qty field is required.",
            "number.greater": "Qty must be greater than 0.",
            "number.base": "The qty must be a number.",
          }),
          id: Joi.number().allow(null).messages({
            "number.base": "The id must be a number or null.",
          }),
          unit: Joi.string().required().messages({
            "any.required": "The Recipe Item unit field is required.",
            "string.base": "The Recipe Item unit must be a string.",
            "string.empty": "The Recipe Item unit cannot be empty.",
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        "any.required": "The items field is required.",
        "array.base": "The items must be an array of objects.",
        "array.min": "The items array must contain at least one item.",
      }),
  });

  const { error } = schema.validate(payload);
  if (error) {
    return res.status(400).json({
      status: "false",
      message: error.message,
    });
  } else {
    next();
  }
};

exports.proFormaNo = function (req, res, next) {
  const { proFormaNo } = req.body;

  const proFormaNoSchema = Joi.string()
    .pattern(/^Q-\d+$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base": `ProForma must be in the format "Q-<number>"`,
      "string.base": "ProForma must be a string",
    });

  const { error } = proFormaNoSchema.validate(proFormaNo);

  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};

exports.update_itemStock = function (req, res, next) {
  const { itemId, qty } = req.body;
  const itemStockSchema = Joi.object({
    itemId: Joi.number().required().messages({
      "any.required": "Required Filed : Item",
      "number.empty": "Item Cannot Be Empty",
    }),
    qty: Joi.number().required().messages({
      "any.required": "Required Filed : Qty",
      "number.empty": "Qty Cannot Be Empty",
      "number.base": "Qty must be number",
    }),
  });

  const { error } = itemStockSchema.validate({ itemId, qty });
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};

exports.itemUnit = async function (req, res, next) {
  const { items } = req.body;
  const itemSchema = Joi.array().items(
    Joi.object({
      unit: Joi.string().required().messages({
        "any.required": "The unit field is required.",
        "string.base": "The unit must be a string.",
        "string.empty": "The unit cannot be empty.",
      }),
    }).options({ allowUnknown: true })
  );
  const { error } = itemSchema.validate(items);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  next();
};

exports.saleNo = async function (req, res, next) {
  const { saleNo } = req.body;
  const saleNoSchema = Joi.number().required().messages({
    "number.base": "Sale Number must be a number",
    "any.required": "Required Field : Sale Number",
    "number.empty": "Sale Number Cannot Be Empty",
  });
  const { error } = saleNoSchema.validate(saleNo);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};

exports.purchaseNo = async function (req, res, next) {
  const { purchaseNo } = req.body;
  const purchaseNoSchema = Joi.number().required().messages({
    "number.base": "Purchase Number must be a number",
    "any.required": "Required Field : Purchase Number",
    "number.empty": "Purchase Number Cannot Be Empty",
  });
  const { error } = purchaseNoSchema.validate(purchaseNo);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};

exports.paymentNo = async function (req, res, next) {
  const { paymentNo } = req.body;
  const paymentNoSchema = Joi.number().required().messages({
    "number.base": "Purchase Number must be a number",
    "any.required": "Required Field : Purchase Number",
    "number.empty": "Purchase Number Cannot Be Empty",
  });
  const { error } = paymentNoSchema.validate(paymentNo);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};

exports.receiptNo = async function (req, res, next) {
  const { receiptNo } = req.body;
  const receiptNoSchema = Joi.number().required().messages({
    "number.base": "Purchase Number must be a number",
    "any.required": "Required Field : Purchase Number",
    "number.empty": "Purchase Number Cannot Be Empty",
  });
  const { error } = receiptNoSchema.validate(receiptNo);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};

exports.paymentType = async function (req, res, next) {
  const { paymentType } = req.body;
  const paymentTypeSchema = Joi.string()
    .valid(...Object.values(PAYMENT_TYPE))
    .required()
    .messages({
      "any.required": "The Payment Type field is required.",
      "any.only": `The Payment Type field must be one of Advance, Payment and Final Payment.`,
    });
  const { error } = paymentTypeSchema.validate(paymentType);
  if (error) {
    return res.status(400).json({
      status: "false",
      message: error.message,
    });
  } else {
    next();
  }
};

exports.supplyInvoiceNo = async function (req, res, next) {
  const { supplyInvoiceNo } = req.body;
  const supplyInvoiceNoSchema = Joi.string().required().messages({
    "string.base": "Supply Number must be a string",
    "any.required": "Required Field : Supply Number",
    "string.empty": "Supply Number Cannot Be Empty",
  });
  const { error } = supplyInvoiceNoSchema.validate(supplyInvoiceNo);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};

exports.dutyTime = async function (req, res, next) {
  const { entryTime, exitTime } = req.body;
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
  const timeSchema = Joi.object({
    entryTime: Joi.string().pattern(timePattern).required().messages({
      "string.pattern.base":
        "Entry time must be in the format HH:mm (24-hour format)",
      "any.required": "Entry time is required",
    }),
    exitTime: Joi.string().pattern(timePattern).required().messages({
      "string.pattern.base":
        "Exit time must be in the format HH:mm (24-hour format)",
      "any.required": "Exit time is required",
    }),
  });
  const { error } = timeSchema.validate({ entryTime, exitTime });
  if (error) {
    return res.status(400).json({
      status: "false",
      message: error.message,
    });
  }
  const [entryHours, entryMinutes] = entryTime.split(":").map(Number);
  const [exitHours, exitMinutes] = exitTime.split(":").map(Number);
  if (
    entryHours > exitHours ||
    (entryHours === exitHours && entryMinutes >= exitMinutes)
  )
    return res.status(400).json({
      status: "false",
      message: "Entry time must be before exit time.",
    });
  next();
};

exports.salaryPaymentType = async function (req, res, next) {
  const { paymentType, companyBankId, userBankId } = req.body;
  const paymentTypeSchema = Joi.object({
    paymentType: Joi.string()
      .valid(...Object.values(SALARY_PAYMENT_TYPE))
      .required()
      .messages({
        "any.required": "The Payment Type field is required.",
        "any.only": "The Payment Type field must be one of Cash or Bank.",
      }),
    companyBankId: Joi.when("paymentType", {
      is: SALARY_PAYMENT_TYPE.BANK,
      then: Joi.number().required().messages({
        "any.required":
          "The Company Bank field is required when Payment Type is Bank.",
      }),
      otherwise: Joi.optional(),
    }),
    userBankId: Joi.when("paymentType", {
      is: SALARY_PAYMENT_TYPE.BANK,
      then: Joi.number().required().messages({
        "any.required":
          "The User Bank field is required when Payment Type is Bank.",
      }),
      otherwise: Joi.optional(),
    }),
  });
  const { error } = paymentTypeSchema.validate({
    paymentType,
    companyBankId,
    userBankId,
  });
  if (error) {
    return res.status(400).json({
      status: "false",
      message: error.message,
    });
  } else {
    next();
  }
};

exports.machineName = async function (req, res, next) {
  const { name } = req.body;
  const machineNameSchema = Joi.string().required().messages({
    "string.base": "Machine Name must be a string",
    "any.required": "Required Field : Machine Name",
    "string.empty": "Machine Name Cannot Be Empty",
  });
  const { error } = machineNameSchema.validate(name);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};

exports.machineNumber = async function (req, res, next) {
  const { machineNo } = req.body;
  const machineNumberSchema = Joi.number().required().messages({
    "number.base": "Machine Number must be a number",
    "any.required": "Required Field : Machine Number",
    "number.empty": "Machine Number Cannot Be Empty",
  });
  const { error } = machineNumberSchema.validate(machineNo);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};

exports.machineId = async function (req, res, next) {
  const { machineId } = req.body;
  const machineIdSchema = Joi.number().required().messages({
    "number.base": "Machine Id must be a number",
    "any.required": "Required Field : Machine Id",
    "number.empty": "Machine id Cannot Be Empty",
  });
  const { error } = machineIdSchema.validate(machineId);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};

exports.cost = async function (req, res, next) {
  const { cost } = req.body;
  const costSchema = Joi.number().allow(null).messages({
    "number.base": "Cost must be a number",
    "number.empty": "Cost Number Cannot Be Empty",
  });
  const { error } = costSchema.validate(cost);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};

exports.name = async function (req, res, next) {
  const { name } = req.body;
  const nameSchema = Joi.string().required().messages({
    "string.base": "Name must be a string",
    "any.required": "Required Field : Name",
    "string.empty": "Name Cannot Be Empty",
  });
  const { error } = nameSchema.validate(name);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  return next();
};

exports.itemGroupId = async function (req, res, next) {
  const { itemGroupId } = req.body;
  const iteGroupIdSchema = Joi.number().required().messages({
    "number.base": "Item Group must be a number",
    "any.required": "Required Field : Item Group",
  });
  const valueToValidate = itemGroupId === "" ? undefined : itemGroupId;
  const { error } = iteGroupIdSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  return next();
};

exports.itemCategoryId = async function (req, res, next) {
  const { itemCategoryId } = req.body;
  const iteCategoryIdSchema = Joi.number().required().messages({
    "number.base": "Item Category must be a number",
    "any.required": "Required Field : Item Category",
  });
  const valueToValidate = itemCategoryId === "" ? undefined : itemCategoryId;
  const { error } = iteCategoryIdSchema.validate(valueToValidate);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  return next();
};

exports.account_validation = async function (req, res, next) {
  const { accountGroupId, ...createPayload } = req.body;
  const accountGroupIdSchema = Joi.number().required().messages({
    "number.base": "Account Group is required.",
    "any.required": "Account Group is required.",
  });

  const accountError = accountGroupIdSchema.validate(accountGroupId);
  if (accountError.error)
    return res
      .status(400)
      .json({ status: true, message: accountError.error.message });

  const companyId = req.user.companyId;
  const accountGroupExist = await AccountGroup.findOne({
    where: {
      id: accountGroupId,
      companyId: companyId,
    },
  });
  if (!accountGroupExist)
    return res
      .status(404)
      .json({ status: "false", message: "Account Group Not Found" });
  const groupName = accountGroupExist.name;

  const accountSchema = Joi.object({
    accountGroupId: Joi.number().required().messages({
      "number.base": "Account Group ID must be a number",
      "any.required": "Account Group is required",
    }),
    accountName: Joi.string().required().messages({
      "string.base": "Account Name must be a string",
      "any.required": "Account Name is required",
      "string.empty": "Account Name cannot be an empty string",
    }),
    shortName: Joi.string().allow(null, "").required().messages({
      "string.base": "Short Name must be a string",
      "any.required": "Short Name is required",
    }),
    contactPersonName: Joi.string().required().messages({
      "string.base": "Contact Person Name must be a string",
      "any.required": "Contact Person Name is required",
      "string.empty": "Contact Person Name cannot be an empty string",
    }),
    accountDetail: Joi.object({
      email: Joi.string()
        .email()
        .when(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.UNSECURED_LOANS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "string.email": "Email must be a valid email address.",
          "any.required": "Email is required field.",
          "any.unknown": "Email is not required.",
          "string.empty": "Email cannot be an empty string",
          "string.base": "Email must be string.",
        }),
      mobileNo: Joi.number()
        .integer()
        .min(1000000000)
        .max(9999999999)
        .when(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.UNSECURED_LOANS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "number.base": "Mobile Number must be a number",
          "number.min": "Mobile Number Must Have At Least 10 Digits",
          "number.max": "Mobile Number Cannot Have More Then 10 Digits",
          "any.required": "Mobile Number is required field.",
          "any.unknown": "Mobile Number is not required.",
        }),
      address1: Joi.string()
        .when(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.UNSECURED_LOANS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "any.required": "Address 1 is required field.",
          "any.unknown": "Address 1 is not required.",
          "string.empty": "Address 1 cannot be an empty string",
          "string.base": "Address 1 must be string.",
        }),
      address2: Joi.string()
        .when(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.UNSECURED_LOANS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.allow(null, ""),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "any.unknown": "Address 2. is not required.",
          "string.base": "Address 2 must be string.",
        }),
      pincode: Joi.number()
        .when(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.UNSECURED_LOANS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "any.required": "Pincode is required field.",
          "any.unknown": "Pincode is not required.",
          "number.base": "Pincode must be number.",
        }),
      state: Joi.string()
        .when(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.UNSECURED_LOANS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "any.required": "State is required field.",
          "any.unknown": "State is not required.",
          "string.empty": "State cannot be an empty string",
          "string.base": "State must be string.",
        }),
      city: Joi.string()
        .when(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.UNSECURED_LOANS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "any.required": "City is required field.",
          "any.unknown": "City is not required.",
          "string.empty": "City cannot be an empty string",
          "string.base": "City must be string.",
        }),
      bankDetail: Joi.boolean()
        .when(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.UNSECURED_LOANS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "any.required": "Bank Detail is required field.",
          "any.unknown": "Bank Detail is not required.",
        }),
      registrationType: Joi.string()
        .valid(...Object.values(REGISTRATION_TYPE))
        .when(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "any.required": "Registration Type is required field.",
          "any.unknown": "Registration Type is not required.",
          "any.only": "Invalid Registration Type provided.",
        }),
      gstNumber: Joi.alternatives()
        .conditional(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.alternatives().conditional("registrationType", {
            is: Joi.valid(REGISTRATION_TYPE.REGULAR),
            then: Joi.string().required().length(15),
            otherwise: Joi.allow(null, ""),
          }),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "string.length": "Invalid GST Number.",
          "any.required": "GST Number is required field.",
          "string.empty": "GST Number cannot be an empty string",
          "string.base": "GST Number is required field.",
          "any.unknown": "GST Number is not required.",
        }),
      panNo: Joi.string()
        .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
        .when(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.UNSECURED_LOANS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.allow(null, ""),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "string.pattern.base": "PAN No. must be a valid PAN Number.",
          "any.unknown": "PAN No. is not required.",
          "string.base": "PAN No. must be string.",
        }),
      accountNumber: Joi.alternatives()
        .conditional(Joi.ref("$groupName"), {
          is: Joi.valid(ACCOUNT_GROUPS_TYPE.BANK_ACCOUNT),
          then: Joi.string().required(),
          otherwise: Joi.alternatives().conditional("bankDetail", {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.forbidden(),
          }),
        })
        .messages({
          "any.required": "Account number is required field.",
          "any.unknown": "Account number is not required.",
          "string.empty": "Account number cannot be an empty string",
          "string.base": "Account number must be string.",
        }),
      ifscCode: Joi.alternatives()
        .conditional(Joi.ref("$groupName"), {
          is: Joi.valid(ACCOUNT_GROUPS_TYPE.BANK_ACCOUNT),
          then: Joi.string().required(),
          otherwise: Joi.alternatives().conditional("bankDetail", {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.forbidden(),
          }),
        })
        .messages({
          "any.required": "IFSC code is required field.",
          "any.unknown": "IFSC code is not required.",
          "string.empty": "IFSC code cannot be an empty string",
          "string.base": "IFSC code must be string.",
        }),
      bankName: Joi.alternatives()
        .conditional(Joi.ref("$groupName"), {
          is: Joi.valid(ACCOUNT_GROUPS_TYPE.BANK_ACCOUNT),
          then: Joi.string().required(),
          otherwise: Joi.alternatives().conditional("bankDetail", {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.forbidden(),
          }),
        })
        .messages({
          "any.required": "Bank name is required field.",
          "any.unknown": "Bank name is not required.",
          "string.empty": "Bank name cannot be an empty string",
          "string.base": "Bank name must be string.",
        }),
      accountHolderName: Joi.alternatives()
        .conditional(Joi.ref("$groupName"), {
          is: Joi.valid(ACCOUNT_GROUPS_TYPE.BANK_ACCOUNT),
          then: Joi.string().required(),
          otherwise: Joi.alternatives().conditional("bankDetail", {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.forbidden(),
          }),
        })
        .messages({
          "any.required": "Account holder name is required field.",
          "any.unknown": "Account holder name is not required.",
          "string.empty": "Account holder name cannot be an empty string",
          "string.base": "Account holder name must be string.",
        }),
      creditLimit: Joi.boolean()
        .when(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "any.required": "Credit limit is required field.",
          "any.unknown": "Credit limit is not required.",
        }),
      totalCredit: Joi.number()
        .when("creditLimit", {
          is: true,
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "any.required": "Total credit is required field.",
          "any.unknown": "Total credit is not required.",
          "number.base": "Total credit must be number.",
        }),
      balance: Joi.number()
        .when(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "any.required": "Opening balance is required field.",
          "any.unknown": "Opening balance is not required.",
          "number.base": "Opening balance must be number.",
        }),
      creditPeriod: Joi.number()
        .when(Joi.ref("$groupName"), {
          is: Joi.valid(
            ACCOUNT_GROUPS_TYPE.SUNDRY_DEBTORS,
            ACCOUNT_GROUPS_TYPE.SUNDRY_CREDITORS
          ),
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        })
        .messages({
          "any.required": "Credit period is required field.",
          "any.unknown": "Credit period is not required.",
          "number.base": "Credit period must be number.",
        }),
    }).messages({
      "object.base": "Account Detail must be an object",
    }),
  });
  const { error, value } = accountSchema.validate(
    { accountGroupId, ...createPayload },
    { context: { groupName } }
  );
  if (error)
    return res.status(400).json({ status: "false", message: error.message });
  return next();
};

exports.accountId = async function (req, res, next) {
  const { accountId } = req.body;
  const accountIdSchema = Joi.number().required().messages({
    "number.base": "Required Field : Account.",
    "any.required": "Required Field : Account",
  });

  const { error } = accountIdSchema.validate(accountId);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  return next();
};

exports.bankAccountId = async function (req, res, next) {
  const { bankAccountId } = req.body;
  const bankAccountIdSchema = Joi.number().required().messages({
    "number.base": "Bank Account Id must be a number",
    "any.required": "Required Field : Bank Account",
  });

  const { error } = bankAccountIdSchema.validate(bankAccountId);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  return next();
};

exports.purchaseOrder_no = async function (req, res, next) {
  const { purchaseOrder_no } = req.body;
  const purchaseOrderSchema = Joi.number().required().messages({
    "number.base": "Purchase Order Id must be a number",
    "any.required": "Required Field : Purchase Order",
  });

  const { error } = purchaseOrderSchema.validate(purchaseOrder_no);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  return next();
};

exports.machine_schedule_validation = async (req, res, next) => {
  const machineScheduleSchema = Joi.object({
    machineId: Joi.number().integer().required().messages({
      "number.base": "Machine ID must be a number",
      "number.integer": "Machine ID must be an integer",
      "any.required": "Machine is required",
    }),
    frequency: Joi.string()
      .valid(...Object.values(MACHINE_SCHEDULE_FREQUENCY))
      .required()
      .messages({
        "string.base": "Frequency must be a string",
        "any.only": `Frequency must be one of ${Object.values(
          MACHINE_SCHEDULE_FREQUENCY
        ).join(", ")}`,
        "any.required": "Frequency is required",
      }),
    date: Joi.date().iso().required().messages({
      "date.base": "Date must be a valid date",
      "date.format": "Date must be in ISO format",
      "any.required": "Date is required",
    }),
    interval: Joi.number().integer().required().messages({
      "number.base": "Interval must be a number",
      "number.integer": "Interval must be an integer",
      "any.required": "Interval is required",
    }),
    type: Joi.string()
      .valid(MACHINE_SCHEDULE_TYPE.PREVENTIVE, MACHINE_SCHEDULE_TYPE.REGULAR)
      .required()
      .messages({
        "string.base": "Type must be a string",
        "any.only": `Type must be one of ${[MACHINE_SCHEDULE_TYPE.PREVENTIVE, MACHINE_SCHEDULE_TYPE.REGULAR].join(", ")}`,
        "any.required": "Type is required",
      }),
    maintenanceType: Joi.array()
      .items(Joi.number())
      .min(1)
      .required()
      .messages({
        "array.base": "Maintenance Type must be an array",
        "array.min": "Maintenance Type must contain at least one item",
        "any.required": "Maintenance Type is required",
      }),
  });
  const { error } = machineScheduleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  return next();
};

exports.transactionType = async (req, res, next) => {
  const { transaction } = req.body;
  const transactionSchema = Joi.object({
    transactionType: Joi.string()
      .valid(...Object.values(TRANSACTION_TYPE))
      .required()
      .messages({
        "string.base": "Transaction must be a string",
        "any.only": `Transaction must be one of ${Object.values(
          MACHINE_SCHEDULE_FREQUENCY
        ).join(", ")}`,
        "any.required": "Transaction is required",
      }),
    bankAccountId: Joi.number()
      .when("transactionType", {
        is: Joi.valid(TRANSACTION_TYPE.BANK),
        then: Joi.required(),
        otherwise: Joi.allow(null, ""),
      })
      .messages({
        "number.base": "Bank Account Id must be a number",
        "any.required": "Required Field : Bank Account",
      }),
    mode: Joi.string()
      .when("transactionType", {
        is: Joi.valid(TRANSACTION_TYPE.BANK),
        then: Joi.required(),
        otherwise: Joi.allow(null, ""),
      })
      .messages({
        "string.base": "Mode must be a string",
        "any.required": "Required Field : Mode",
      }),
  });
  const { error } = transactionSchema.validate(transaction);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  return next();
};

exports.saleInvoiceId = async function (req, res, next) {
  const { saleInvoiceId } = req.body;
  const saleInvoiceSchema = Joi.number().required().messages({
    "number.base": "Sale Invoice Number must be a number",
    "any.required": "Required Field : Sale Invoice",
    "number.empty": "Sale Invoice Number Cannot Be Empty",
  });
  const { error } = saleInvoiceSchema.validate(saleInvoiceId);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};

exports.purchaseDate = function (req, res, next) {
  const { purchaseDate } = req.body;
  const purchaseDateSchema = Joi.string().required().messages({
    "any.required": "Required Field :Purchase Date",
    "string.empty": "Purchase Date Cannot Be Empty",
    "string.base": "Purchase Date Must Be A String",
  });
  const { error } = purchaseDateSchema.validate(purchaseDate);
  if (purchaseDate === null) {
    return res
      .status(400)
      .json({ status: "False", message: "Purchase Invoice Cannot Be Empty" });
  }
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};

exports.wastageName = function (req, res, next) {
  const { name } = req.body;
  const nameSchema = Joi.string().required().messages({
    "any.required": "Required Field :Wastage Name",
    "string.empty": "Wastage Name Cannot Be Empty",
    "string.base": "Wastage Name Must Be A String",
  });
  const { error } = nameSchema.validate(name);
  if (error) {
    return res.status(400).json({ status: "False", message: error.message });
  }
  next();
};

exports.maintenance_validation = async (req, res, next) => {
  const maintenanceSchema = Joi.object({
    machineId: Joi.number().integer().required().messages({
      "number.base": "Machine ID must be a number",
      "number.integer": "Machine ID must be an integer",
      "any.required": "Machine is required",
    }),
    date: Joi.date().iso().required().messages({
      "date.base": "Date must be a valid date",
      "date.format": "Date must be in ISO format",
      "any.required": "Date is required",
    }),
    type: Joi.string()
      .valid(...Object.values(MACHINE_SCHEDULE_TYPE))
      .required()
      .messages({
        "string.base": "Type must be a string",
        "any.only": `Type must be one of ${Object.values(
          MACHINE_SCHEDULE_TYPE
        ).join(", ")}`,
        "any.required": "Type is required",
      }),
    maintenanceType: Joi.array()
      .items(Joi.number())
      .min(1)
      .required()
      .messages({
        "array.base": "Maintenance Type must be an array",
        "array.min": "Maintenance Type must contain at least one item",
        "any.required": "Maintenance Type is required",
      }),
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.number().required().messages({
            "number.base": "Product ID must be a number",
            "any.required": "Product ID is required",
          }),
          qty: Joi.number().required().messages({
            "number.base": "Quantity must be a number",
            "any.required": "Quantity is required",
          }),
          id: Joi.number().optional().allow(null).messages({
            "number.base": "Id must be a number",
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.base": "Item must be an array",
        "array.min": "Item must contain at least one product",
        "any.required": "Item is required",
      }),
  });
  const { error } = maintenanceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: "false", message: error.message });
  }
  return next();
};
