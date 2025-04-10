export const generateOTP = (): string => {
    const otp = Math.floor(Math.random() * 1000000);

    // Convierte a string y rellena con ceros a la izquierda si es necesario
    // para asegurar que siempre tenga 6 dígitos
    return otp.toString().padStart(6, '0');
}