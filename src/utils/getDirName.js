const getDirName = (address) => {
  try {
    const url = new URL(address.trim());
    return url.hostname.replace(/[^0-9a-z]/gi, '-');
  } catch (e) {
    throw new Error('Incorrect address (must be as \'http://example.com\')');
  }
};

export default getDirName;
