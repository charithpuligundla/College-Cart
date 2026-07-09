import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Payment() {
    const { requestId } = useParams();
    const [request, setrequest] = useState(null);
    const backenduri = import.meta.env.VITE_BACKENDURI;
    const token = localStorage.getItem("token");

    async function getreq() {
        try {
            const res = await axios.post(`${backenduri}/getrequest`, { requestId },
                { headers: { Authorization: `Bearer ${token}` }});
            setrequest(res.data.request);
        }
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getreq();
    }, []);

    const handlePayNow = () => {
        if (!request) {
            alert("No active order found. Please create an order first.");
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: request.amountToPay * 100, // Convert to paise
            currency: "INR",
            order_id: request.razorpayOrderId,
            name: "Marketplace Inc.",
            description: "Complete your payment",
            handler: async function (response) {
                try {
                    // Send transaction hashes to backend to verify and update DB to "Paid"
                    const verifyResponse = await axios.post(
                        `${backenduri}/verify-payment`,
                        {
                            dbOrderId: requestId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        },
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );

                    if (verifyResponse.data.success) {
                        alert("Payment Success! Your order is confirmed.")
                    }
                } catch (err) {
                    console.error("Verification failed", err);
                    alert("Payment verification failed. Please contact support.");
                }
            },
            // prefill: {
            //     name: "John Doe",
            //     email: "john@example.com"
            // },
            theme: {
                color: "#3399cc"
            }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
    };

    return (
        <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h2>Premium Product</h2>
            <p>Secure checkout architecture implementation.</p>

            <button
                onClick={handlePayNow}
                style={{
                    padding: "10px 20px",
                    backgroundColor: request ? "#3399cc" : "#ccc",
                    color: "white",
                    border: "none",
                    cursor: request ? "pointer" : "not-allowed"
                }}
            >
                Pay Now
            </button>
        </div>
    );
};
