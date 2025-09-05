const Account = require('../models/Account');
const AccountDetail = require('../models/AccountDetail');
const {Sequelize} = require("sequelize");

exports.isUnique = async(field, value, companyId, accountId = null)=> {
    if (!value) return false;
    return await Account.findOne({
        where: {companyId: companyId, ...(accountId ? { id: { [Sequelize.Op.ne]: accountId } } : {}) },
        include: {model: AccountDetail, as: "accountDetail", where: {[field]: value}}
    });
}