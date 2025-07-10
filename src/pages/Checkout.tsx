import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart, CartItem } from "../contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  CreditCard,
  Building,
  Check,
  Landmark,
  Banknote,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { customerService, orderService } from "../lib/api/services";
import { CreateOrderPayload, Store, VoucherTemplate } from "../lib/api/types";
import { format } from "date-fns";
import PaymentBrick from "@/components/PaymentBrick";

type CheckoutStep =
  | "customer-info"
  | "payment"
  | "confirmation"
  | "confirmationPayment";

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

type PaymentMethod = "stripe" | "paypal" | "mercadopago";

interface CheckoutVoucherData {
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  message?: string;
  template: string;
}

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("customer-info");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const orderExecutedRef = useRef(false);

  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState("")

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      toast.error("Your cart is empty. Redirecting to store.");
      navigate("/store");
      return;
    }
    if (items.length > 1) {
      toast.error(
        "Checkout currently supports only one item. Redirecting to cart."
      );
      navigate("/cart");
      return;
    }

    const item = items[0];
    const voucherDetails = item?.voucherData as CheckoutVoucherData | undefined;
    if (voucherDetails) {
      setCustomerInfo((prev) => ({
        ...prev,
        fullName: voucherDetails.senderName || prev.fullName,
        email: voucherDetails.senderEmail || prev.email,
      }));
    }
  }, [items, navigate]);

  const handleCustomerInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateCustomerInfo = () => {
    // Required fields validation
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "country",
    ];
    const missingFields = requiredFields.filter(
      (field) => !customerInfo[field as keyof CustomerInfo]
    );

    if (missingFields.length > 0) {
      const formattedFields = missingFields
        .map((field) => field.replace(/([A-Z])/g, " $1").toLowerCase())
        .join(", ");
      toast.error(`Required fields missing: ${formattedFields}`);
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Phone validation (at least 7 digits)
    const phoneDigits = customerInfo.phone.replace(/\D/g, "");
    if (phoneDigits.length < 7) {
      toast.error("Phone number must have at least 7 digits");
      return false;
    }

    // Address validation (minimum length)
    if (customerInfo.address.trim().length < 7) {
      toast.error("Address must be at least 7 characters long");
      return false;
    }

    // City validation (no numbers or special characters)
    const cityRegex = /^[a-zA-Z\s\-']+$/;
    if (!cityRegex.test(customerInfo.city)) {
      toast.error(
        "City name should only contain letters, spaces, hyphens, and apostrophes"
      );
      return false;
    }

    // Country validation (no numbers or special characters)
    const countryRegex = /^[a-zA-Z\s\-']+$/;
    if (!countryRegex.test(customerInfo.country)) {
      toast.error(
        "Country name should only contain letters, spaces, hyphens, and apostrophes"
      );
      return false;
    }

    // Zip code validation (if provided)
    if (customerInfo.zipCode) {
      const zipRegex = /^[a-zA-Z0-9\s-]{3,10}$/;
      if (!zipRegex.test(customerInfo.zipCode)) {
        toast.error("Invalid zip/postal code format");
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (currentStep === "customer-info") {
      if (!validateCustomerInfo()) return;
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      setCurrentStep("confirmationPayment"); // ahora es el paso 3
    } else if (currentStep === "confirmationPayment") {
      setCurrentStep("confirmation"); // ahora es el paso 4
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === "payment") {
      setCurrentStep("customer-info");
    } else if (currentStep === "confirmationPayment") {
      setCurrentStep("payment");
    } else if (currentStep === "confirmation") {
      setCurrentStep("confirmationPayment");
    }
  };

  const executeOrder = async () => {
    try {
      const cartItem = items[0];
      const voucherDetails = cartItem?.voucherData as
        | CheckoutVoucherData
        | undefined;

      if (!voucherDetails || !cartItem.store) {
        throw new Error("Voucher details or Store ID missing.");
      }

      // Validate emails before proceeding
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(voucherDetails.senderEmail)) {
        throw new Error("Sender email is invalid");
      }
      if (!emailRegex.test(voucherDetails.receiverEmail)) {
        throw new Error("Receiver email is invalid");
      }

      // Get or create customer using the new endpoint
      const customer = await customerService.getOrCreate({
        fullName: customerInfo.fullName,
        email: customerInfo.email,
        phoneNumber: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        zipCode: customerInfo.zipCode,
        country: customerInfo.country,
        userId: null, // We don't have a user ID in this context
      });

      // Convert template number to proper format (e.g., "5" to "template5")
      const templateNumber = voucherDetails.template.replace(/\D/g, "");
      const formattedTemplate = `template${templateNumber}` as VoucherTemplate;

      const paymentDetails = {
        paymentId: `mock_${Date.now()}`,
        status: "completed",
        paymentStatus: "completed",
        paymentEmail: customerInfo.email,
        amount: totalPrice,
        provider: paymentMethod,
      };

      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      const orderPayload: CreateOrderPayload = {
        customerId: customer._id,
        paymentDetails,
        voucher: {
          storeId: cartItem.storeId,
          productId: cartItem.id,
          expirationDate: expirationDate.toISOString(),
          senderName: voucherDetails.senderName,
          senderEmail: voucherDetails.senderEmail,
          receiverName: voucherDetails.receiverName,
          receiverEmail: voucherDetails.receiverEmail,
          message: voucherDetails.message || "",
          template: formattedTemplate,
        },
      };

      const order = await orderService.create(orderPayload);
      console.log(order, "se creo la order nomsa");
      setCustomerId(order._id)

      // Prepare order info for success page
      const orderInfo = {
        orderId: order._id,
        orderDate: order.createdAt,
        customerInfo: {
          fullName: customerInfo.fullName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          zipCode: customerInfo.zipCode,
          country: customerInfo.country,
        },
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || "/placeholder.png",
          store: item.store || "N/A",
        })),
        totalPrice,
        paymentMethod,
      };

      // toast.success("Order placed successfully!");
      // clearCart();
      // navigate("/checkout/success", {
      //   state: { orderInfo },
      //   replace: true,
      // });
      // TODO: ESTO DEPSUES TENES QUE PONERLO AL FINAL
    } catch (err: any) {
      console.error("Checkout failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred during checkout.";
      setError(errorMessage);

      // Navigate to error page with error details
      navigate("/checkout/error", {
        state: {
          error: errorMessage,
          reason:
            err.response?.data?.message ||
            "Please try again or contact customer support.",
        },
        replace: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (currentStep === "payment" && !orderExecutedRef.current) {
      orderExecutedRef.current = true;
      executeOrder();
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    if (items.length !== 1) {
      toast.error("Invalid cart state for checkout.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    // try {
    //   const cartItem = items[0];
    //   const voucherDetails = cartItem?.voucherData as
    //     | CheckoutVoucherData
    //     | undefined;

    //   if (!voucherDetails || !cartItem.store) {
    //     throw new Error("Voucher details or Store ID missing.");
    //   }

    //   // Validate emails before proceeding
    //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   if (!emailRegex.test(voucherDetails.senderEmail)) {
    //     throw new Error("Sender email is invalid");
    //   }
    //   if (!emailRegex.test(voucherDetails.receiverEmail)) {
    //     throw new Error("Receiver email is invalid");
    //   }

    //   // Get or create customer using the new endpoint
    //   const customer = await customerService.getOrCreate({
    //     fullName: customerInfo.fullName,
    //     email: customerInfo.email,
    //     phoneNumber: customerInfo.phone,
    //     address: customerInfo.address,
    //     city: customerInfo.city,
    //     zipCode: customerInfo.zipCode,
    //     country: customerInfo.country,
    //     userId: null, // We don't have a user ID in this context
    //   });

    //   // Convert template number to proper format (e.g., "5" to "template5")
    //   const templateNumber = voucherDetails.template.replace(/\D/g, "");
    //   const formattedTemplate = `template${templateNumber}` as VoucherTemplate;

    //   const paymentDetails = {
    //     paymentId: `mock_${Date.now()}`,
    //     status: "completed",
    //     paymentStatus: "completed",
    //     paymentEmail: customerInfo.email,
    //     amount: totalPrice,
    //     provider: paymentMethod,
    //   };

    //   const expirationDate = new Date();
    //   expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    //   const orderPayload: CreateOrderPayload = {
    //     customerId: customer._id,
    //     paymentDetails,
    //     voucher: {
    //       storeId: cartItem.storeId,
    //       productId: cartItem.id,
    //       expirationDate: expirationDate.toISOString(),
    //       senderName: voucherDetails.senderName,
    //       senderEmail: voucherDetails.senderEmail,
    //       receiverName: voucherDetails.receiverName,
    //       receiverEmail: voucherDetails.receiverEmail,
    //       message: voucherDetails.message || "",
    //       template: formattedTemplate,
    //     },
    //   };

    //   const order = await orderService.create(orderPayload);

    //   // Prepare order info for success page
    //   const orderInfo = {
    //     orderId: order._id,
    //     orderDate: order.createdAt,
    //     customerInfo: {
    //       fullName: customerInfo.fullName,
    //       email: customerInfo.email,
    //       phone: customerInfo.phone,
    //       address: customerInfo.address,
    //       city: customerInfo.city,
    //       zipCode: customerInfo.zipCode,
    //       country: customerInfo.country,
    //     },
    //     items: items.map((item) => ({
    //       id: item.id,
    //       name: item.name,
    //       price: item.price,
    //       quantity: item.quantity,
    //       image: item.image || "/placeholder.png",
    //       store: item.store || "N/A",
    //     })),
    //     totalPrice,
    //     paymentMethod,
    //   };

    //   toast.success("Order placed successfully!");
    //   clearCart();
    //   navigate("/checkout/success", {
    //     state: { orderInfo },
    //     replace: true,
    //   });
    // } catch (err: any) {
    //   console.error("Checkout failed:", err);
    //   const errorMessage =
    //     err.response?.data?.message ||
    //     err.message ||
    //     "An unexpected error occurred during checkout.";
    //   setError(errorMessage);

    //   // Navigate to error page with error details
    //   navigate("/checkout/error", {
    //     state: {
    //       error: errorMessage,
    //       reason:
    //         err.response?.data?.message ||
    //         "Please try again or contact customer support.",
    //     },
    //     replace: true,
    //   });
    // } finally {
    //   setIsProcessing(false);
    // }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === "customer-info"
                ? "bg-gifty-500 text-white"
                : "bg-white text-gifty-500 border border-gifty-500"
            }`}
          >
            1
          </div>
          <div
            className={`h-1 w-12 sm:w-24 ${
              currentStep !== "customer-info" ? "bg-gifty-500" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === "payment"
                ? "bg-gifty-500 text-white"
                : currentStep === "confirmation"
                ? "bg-gifty-500 text-white"
                : "bg-white text-gray-400 border border-gray-300"
            }`}
          >
            2
          </div>
          <div
            className={`h-1 w-12 sm:w-24 ${
              currentStep === "confirmation" ? "bg-gifty-500" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === "confirmationPayment"
                ? "bg-gifty-500 text-white"
                : "bg-white text-gray-400 border border-gray-300"
            }`}
          >
            3
          </div>
          <div
            className={`h-1 w-12 sm:w-24 ${
              currentStep === "confirmation" ? "bg-gifty-500" : "bg-gray-300"
            }`}
          />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === "confirmation"
                ? "bg-gifty-500 text-white"
                : "bg-white text-gray-400 border border-gray-300"
            }`}
          >
            4
          </div>
        </div>
      </div>
    );
  };

  const renderCustomerInfoStep = () => {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              Enter your details to complete the purchase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={customerInfo.fullName}
                  onChange={handleCustomerInfoChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={handleCustomerInfoChange}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                value={customerInfo.phone}
                onChange={handleCustomerInfoChange}
                placeholder="+1 (123) 456-7890"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                name="address"
                value={customerInfo.address}
                onChange={handleCustomerInfoChange}
                placeholder="123 Main St, Apt 4B"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={customerInfo.city}
                  onChange={handleCustomerInfoChange}
                  placeholder="New York"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip/Postal Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={customerInfo.zipCode}
                  onChange={handleCustomerInfoChange}
                  placeholder="10001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={customerInfo.country}
                  onChange={handleCustomerInfoChange}
                  placeholder="United States"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-2">Error: {error}</p>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              onClick={handleNextStep}
              className="bg-gifty-500 hover:bg-gifty-600 text-white"
            >
              Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  const renderPaymentStep = () => {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Select your preferred payment method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
              className="space-y-4"
            >
              {/* <div className="flex items-center space-x-4 rounded-md border p-4">
                <RadioGroupItem value="stripe" id="stripe" />
                <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-5 w-5 text-gifty-500" />
                  <div>
                    <p className="font-medium">Stripe</p>
                    <p className="text-sm text-gray-500">Pay with credit/debit card via Stripe</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
                  <Landmark className="h-5 w-5 text-gifty-500" />
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-sm text-gray-500">Pay via PayPal</p>
                  </div>
                </Label>
              </div> */}

              <div className="flex items-center space-x-4 rounded-md border p-4">
                <RadioGroupItem value="mercadopago" id="mercadopago" />
                <Label
                  htmlFor="mercadopago"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="h-5 w-5 text-gifty-500" />
                  <div>
                    <p className="font-medium">Mercado Pago</p>
                    <p className="text-sm text-gray-500">
                      Pay with credit/debit card via Mercado Pago
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={handlePreviousStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Information
            </Button>
            <Button
              onClick={handleNextStep}
              className="bg-gifty-500 hover:bg-gifty-600 text-white"
            >
              Review Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  const renderCheckoutMp = () => {
    if(customerId === "" ) return;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            Enter your details to complete the purchase.
          </CardDescription>
        </CardHeader>

        <PaymentBrick
          orderId={customerId}
          amount={totalPrice}
          active={orderExecutedRef.current}
        />

        <CardFooter className="justify-end">
          <Button
            onClick={handleNextStep}
            className="bg-gifty-500 hover:bg-gifty-600 text-white"
          >
            Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderConfirmationStep = () => {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Review Your Order</CardTitle>
            <CardDescription>
              Please review your order details before finalizing your purchase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Items</h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Store ID: {item.store ?? "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p>
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-right">
                <p className="font-semibold text-lg">
                  Total: ${totalPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Customer Information
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {customerInfo.fullName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {customerInfo.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {customerInfo.phone}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {customerInfo.address}
                  </p>
                  <p>
                    <span className="font-medium">City:</span>{" "}
                    {customerInfo.city}
                  </p>
                  {customerInfo.zipCode && (
                    <p>
                      <span className="font-medium">Zip Code:</span>{" "}
                      {customerInfo.zipCode}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Country:</span>{" "}
                    {customerInfo.country}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Payment Method</h3>
                <div className="text-sm">
                  {paymentMethod === "stripe" && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-gifty-500" />
                      <p>Pay with Stripe</p>
                    </div>
                  )}
                  {paymentMethod === "paypal" && (
                    <div className="flex items-center gap-2">
                      <Landmark className="h-5 w-5 text-gifty-500" />
                      <p>Pay with PayPal</p>
                    </div>
                  )}
                  {paymentMethod === "mercadopago" && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-gifty-500" />
                      <p>Pay with Mercado Pago</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-2">
                Error during submission: {error}
              </p>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={isProcessing}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payment
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gifty-500 hover:bg-gifty-600 text-white"
              disabled={isProcessing}
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" /> Complete Order
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
            Checkout
          </h1>

          {renderStepIndicator()}

          {currentStep === "customer-info" && renderCustomerInfoStep()}
          {currentStep === "payment" && renderPaymentStep()}
          {currentStep === "confirmationPayment" && renderCheckoutMp()}
          {currentStep === "confirmation" && renderConfirmationStep()}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
