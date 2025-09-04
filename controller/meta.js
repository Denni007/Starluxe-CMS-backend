const LeadStatus = require("../models/LeadStatus");
const LeadSource = require("../models/LeadSource");
const Industry = require("../models/Industry");

exports.seedMeta = async (_req, res) => {
  const statuses = ["New","Contacted","Qualified","Proposal","Won","Lost"];
  const sources = ["Website","Referral","IndiaMART","Cold Call","Email"];
  const industries = ["Information Technology","Manufacturing","Retail","Healthcare","Finance","Logistics","Education","Real Estate","Energy","Hospitality"];
  const [s, so, i] = await Promise.all([
    Promise.all(statuses.map(name => LeadStatus.findOrCreate({ where: { name }, defaults: { name } }))),
    Promise.all(sources.map(name => LeadSource.findOrCreate({ where: { name }, defaults: { name } }))),
    Promise.all(industries.map(name => Industry.findOrCreate({ where: { name }, defaults: { name } }))),
  ]);
  res.json({ status: "true", seeded: { leadStatuses: s.length, leadSources: so.length, industries: i.length } });
};