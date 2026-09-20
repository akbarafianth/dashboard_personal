function validatePayload(payload, config) {
  for (const field of config.required) {
    if (payload[field] === undefined || payload[field] === null || String(payload[field]).trim() === '') {
      return `Field ${field} wajib diisi`;
    }
  }
  return null;
}

function buildInsert(payload, config) {
  const fields = config.columns.filter((field) => payload[field] !== undefined);
  const values = fields.map((field) => payload[field]);
  const placeholders = fields.map((_, index) => `$${index + 1}`);
  return { fields, values, placeholders };
}

function buildUpdate(payload, config) {
  const fields = config.columns.filter((field) => payload[field] !== undefined);
  const values = fields.map((field) => payload[field]);
  const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
  return { fields, values, assignments };
}

module.exports = {
  validatePayload,
  buildInsert,
  buildUpdate
};
