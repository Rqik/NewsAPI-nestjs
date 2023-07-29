const isArrayOrString = (value: any) => {
  return Array.isArray(value) || typeof value === 'string';
};

export { isArrayOrString };
