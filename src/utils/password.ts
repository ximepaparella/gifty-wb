/**
 * Generates a random password with a specified length.
 * Includes uppercase letters, lowercase letters, numbers, and special characters.
 * @param length The desired length of the password (default: 12).
 * @returns A randomly generated password string.
 */
export function generateRandomPassword(length: number = 12): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;

  let password = '';

  // Ensure at least one character type from each set
  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  password += numberChars[Math.floor(Math.random() * numberChars.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Fill the rest of the password length with random characters from all sets
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password characters to ensure randomness
  password = password.split('').sort(() => 0.5 - Math.random()).join('');

  return password;
} 