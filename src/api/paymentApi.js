
const BASE_URL = "http://192.168.1.33:5013/api/v1";


export async function saveCard({ cardToken, holder, exp }) {
  const res = await fetch(`${BASE_URL}/payments/cards`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardToken, holder, exp }),
  });
  if (!res.ok) throw new Error("No se pudo guardar la tarjeta");
  return await res.json();
}

export async function validateToken({ token }) {
    const res = await fetch(`${BASE_URL}/PaymentMethod/ValidateToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
    });
    
    if (!res.ok){
        throw new Error("No se pudo validar el token");
    }

    return true;
}
