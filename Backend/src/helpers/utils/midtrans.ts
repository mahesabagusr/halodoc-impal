import midtransClient from "midtrans-client";

const isMidtransProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

// Create Snap API instance
export const snap = new midtransClient.Snap({
  isProduction: isMidtransProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export const coreApi = new midtransClient.CoreApi({
  isProduction: isMidtransProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});
