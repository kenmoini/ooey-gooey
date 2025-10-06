/**
 * Validates an IPv4 address
 * @param ip - The IP address string to validate
 * @returns Error message if invalid, empty string if valid
 */
export const validateIPv4Address = (ip: string): string => {
  if (ip.length === 0) {
    return "";
  }

  // Split the IP address into octets
  const octets = ip.split(".");

  // Must have exactly 4 octets
  if (octets.length !== 4) {
    return "IPv4 address must have exactly 4 octets (e.g., 192.168.1.100)";
  }

  // Validate each octet
  for (const octet of octets) {
    // Check if empty
    if (octet.length === 0) {
      return "IPv4 address octets cannot be empty";
    }

    // Check if it's a valid number
    const num = parseInt(octet, 10);
    if (isNaN(num)) {
      return "IPv4 address octets must be numeric";
    }

    // Check if it has leading zeros (not allowed in standard notation)
    if (octet.length > 1 && octet[0] === "0") {
      return "IPv4 address octets cannot have leading zeros";
    }

    // Check range (0-255)
    if (num < 0 || num > 255) {
      return "IPv4 address octets must be between 0 and 255";
    }

    // Check if the string representation matches (no extra characters)
    if (octet !== num.toString()) {
      return "Invalid IPv4 address format";
    }
  }

  return "";
};

/**
 * Validates an IPv4 CIDR notation
 * @param cidr - The CIDR string to validate (e.g., "192.168.1.0/24")
 * @returns Error message if invalid, empty string if valid
 */
export const validateIPv4CIDR = (cidr: string): string => {
  if (cidr.length === 0) {
    return "";
  }

  // Split into IP and prefix
  const parts = cidr.split("/");

  // Must have exactly 2 parts
  if (parts.length !== 2) {
    return "CIDR must be in format: IP/prefix (e.g., 192.168.1.0/24)";
  }

  const [ip, prefixStr] = parts;

  // Validate the IP address part
  const ipError = validateIPv4Address(ip);
  if (ipError) {
    return ipError;
  }

  // Validate the prefix length
  const prefix = parseInt(prefixStr, 10);
  if (isNaN(prefix)) {
    return "CIDR prefix must be numeric";
  }

  if (prefix < 0 || prefix > 32) {
    return "CIDR prefix must be between 0 and 32";
  }

  // Check if the string representation matches (no extra characters)
  if (prefixStr !== prefix.toString()) {
    return "Invalid CIDR prefix format";
  }

  return "";
};
