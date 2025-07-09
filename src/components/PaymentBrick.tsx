import { orderPayment } from "@/lib/api/services";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface PaymentBrickProps {
  amount: number;
  orderId: string;
  active: boolean;
}

const PaymentBrick = ({ orderId, amount, active }: PaymentBrickProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) return;

    const mp = new window.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, {
      locale: "es-AR",
    });

    mp.bricks().create("cardPayment", "cardPaymentBrick_container", {
      initialization: {
        amount,
      },
      callbacks: {
        onSubmit: async (cardFormData: any) => {
          setLoading(true);
          setError(null);

          try {
            const data = await orderPayment.mercadoPago(orderId, cardFormData, amount);

            if (data.status === "approved") {
              alert("Pago aprobado ✅");
              // Podés redirigir o actualizar estado global acá
            } else {
              alert("Pago en proceso o rechazado ❗");
              setError("El pago fue rechazado o está pendiente.");
            }
          } catch (err) {
            console.error("Error al procesar el pago", err);
            setError("Ocurrió un error al procesar el pago.");
          } finally {
            setLoading(false);
          }
        },
        onError: (error: any) => {
          console.error("Error en el brick", error);
          setError("Error interno del Brick de MercadoPago.");
        },
        onReady: () => {
          console.log("Brick listo");
        },
      },
    });
  }, [active, amount, orderId]);

  if (!active) return null;

  return (
    <div>
      <div id="cardPaymentBrick_container" style={{ minHeight: 300 }} />
      {loading && <p className="text-sm text-gray-500 mt-2">Procesando pago...</p>}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default PaymentBrick;
