/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/purity */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppSelector } from "@/lib/hooks";
import { useGetProductsQuery } from "@/lib/features/api/productApi";
import { useGetOrdersQuery } from "@/lib/features/api/orderApi";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface BotCategory {
  id: string;
  name: string;
  questions: string[];
  response: string;
}

const BOT_CATEGORIES: BotCategory[] = [
  {
    id: "greetings",
    name: "Greetings",
    questions: [
      "hi", "hello", "hey", "start", "greetings", "anyone there", "help",
      "good morning", "good afternoon", "who are you", "what is your name",
      "can you help me", "how are you", "yo"
    ],
    response: "Hello! Welcome to Aura Marketplace. I am your Aura Assistant. How can I help you today? You can ask me about our premium products, shipping services, returns policy, how to submit reviews, or earning Aura loyalty points!",
  },
  {
    id: "products",
    name: "Products & Shop",
    questions: [
      "what products do you sell?", "list all items in your store",
      "tell me about the products", "what can I buy here?",
      "do you have headphones or watch?", "show catalog items and pricing",
      "product details and pricing", "what is the store catalog",
      "what brand is this", "tell me about nike shoes", "do you have watch",
      "list premium goods", "prices of watches"
    ],
    response: "We offer a curated selection of premium products:\n\n• **Sony Noise Cancelling Headphones** ($299.00)\n• **Apple Watch Series 8** ($399.00)\n• **Polaroid Now+ Instant Camera** ($149.00)\n• **Nike Air Max 270** ($160.00)\n\nYou can browse details, add products to your cart, and add to wishlist directly on the **[Collections page](/collections)**!",
  },
  {
    id: "points",
    name: "Aura loyalty points",
    questions: [
      "how do loyalty points work?", "tell me about aura points",
      "how can I earn aura points?", "what are aura points?",
      "how do I get points on my dashboard?", "how many points do I get for purchasing?",
      "tell me about my loyalty points", "where can I check my aura points",
      "loyalty scheme dashboard points score calculation", "what are dynamic aura points"
    ],
    response: "Aura Points is our loyalty program! You earn **5 Aura Points for every $1 spent** on our store. These points are calculated automatically based on your total order value and are displayed dynamically on your **[Dashboard Overview](/dashboard)**.",
  },
  {
    id: "shipping",
    name: "Shipping & Delivery",
    questions: [
      "what are your shipping options?", "how long does delivery take?",
      "shipping and delivery policy", "express shipping versus standard",
      "when will my package arrive?", "estimated delivery time",
      "how do I track my order?", "is there free shipping", "how long is standard shipping",
      "how many days to deliver orders"
    ],
    response: "We offer two reliable shipping modes:\n\n• **Standard Shipping**: 3-5 business days.\n• **Express Shipping**: 1-2 business days.\n\nYou can track the estimated delivery dates and active package statuses anytime on the **[Orders Dashboard](/dashboard/orders)**.",
  },
  {
    id: "returns",
    name: "Returns & Refunds",
    questions: [
      "what is the return policy?", "can I refund my order?",
      "how do I return an item?", "is there a return window?",
      "30 days returns policy", "how do I get my money back?",
      "can I exchange products", "refund processing time", "how to cancel or refund"
    ],
    response: "We want you to love your purchase! We support **free returns and exchanges within 30 days** of delivery. Items must be in their original packaging and condition.",
  },
  {
    id: "reviews",
    name: "Writing Reviews",
    questions: [
      "how do I write a review?", "can I upload photos to my review?",
      "how to review a product with image", "how do I review my purchased items?",
      "where is the review button in dashboard?", "review button is missing next to order",
      "how to rate products", "how to upload review image", "can i submit review picture photo"
    ],
    response: "To review an item, make sure it has been ordered and delivered. Then:\n\n1. Go to your **[Orders Dashboard](/dashboard/orders)**.\n2. Locate the delivered item and click **Review Item**.\n3. Enter your star rating, review comments, and optionally **choose a review photo/image** to upload!\n\nYour review (including uploaded photo) will show up dynamically on the product detail page.",
  },
  {
    id: "payments",
    name: "Payments & Stripe",
    questions: [
      "what payment methods do you support?", "can I pay with bkash?",
      "do you accept credit card or stripe?", "how do I pay for my orders?",
      "payment option at checkout", "is credit card supported", "payment method",
      "stripe card payments versus bkash"
    ],
    response: "We support secure checkouts with:\n\n• **Stripe**: Credit/debit card processing.\n• **bKash**: Direct mobile financial bank transfer.\n\nYou can choose your payment options at the checkout page.",
  },
  {
    id: "support",
    name: "Customer Support",
    questions: [
      "how can I contact customer support?", "what is support email or phone number?",
      "contact details for help", "how to submit support tickets?",
      "customer care phone number", "where is the support dashboard", "help desk",
      "customer support chat email number"
    ],
    response: "Need direct help? You can:\n\n• Submit a ticket in the **[Support Dashboard](/dashboard/support)**.\n• Email us at **support@auramarketplace.com**.\n• Call us at **+1 (555) 123-4567** (Mon-Fri, 9 AM - 5 PM).",
  },
];

const SUGGESTIONS = [
  "What products do you have?",
  "How do I earn Aura Points?",
  "How do I upload review images?",
  "What is the shipping policy?",
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function calculateSimilarity(tokens1: string[], tokens2: string[]): number {
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  return intersection.size / (set1.size + set2.size - intersection.size);
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "bot",
      text: "Hi there! 👋 I am your Aura Assistant. Ask me anything about products, orders, payments, reviews, or loyalty points!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Draggable bubble button position (from viewport bottom-right)
  const [btnPos, setBtnPos] = useState({ right: 24, bottom: 24 });
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, right: 24, bottom: 24 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const onBubblePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = {
      mx: e.clientX,
      my: e.clientY,
      right: btnPos.right,
      bottom: btnPos.bottom,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [btnPos]);

  const onBubblePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    // Only start moving after 4px threshold to avoid accidental drags
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMoved.current = true;
    }
    if (!hasMoved.current) return;
    const BTN_SIZE = 56;
    setBtnPos({
      right: Math.max(8, Math.min(window.innerWidth - BTN_SIZE - 8, dragStart.current.right - dx)),
      bottom: Math.max(8, Math.min(window.innerHeight - BTN_SIZE - 8, dragStart.current.bottom - dy)),
    });
  }, []);

  const onBubblePointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    isDragging.current = false;
    // Only toggle chat if the user just clicked (didn't drag)
    if (!hasMoved.current) {
      setIsOpen((prev) => !prev);
    }
    hasMoved.current = false;
    e.preventDefault();
  }, []);

  const { user } = useAppSelector((state) => state.auth);
  const userEmail = user?.email || (typeof window !== "undefined" ? localStorage.getItem("userEmail") : "");

  const { data: productsData } = useGetProductsQuery();
  const { data: ordersData } = useGetOrdersQuery(
    userEmail ? { search: userEmail } : undefined,
    { skip: !userEmail }
  );

  const productsList = productsData?.success && productsData.data ? productsData.data : [];
  const ordersList = ordersData?.success && ordersData.data ? ordersData.data : [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const localChatbotFallback = (text: string) => {
    const normalized = text.toLowerCase();
    const inputTokens = tokenize(normalized);

    let bestCategory: BotCategory | null = null;
    let maxScore = 0;

    // 1. Check similarity score
    for (const cat of BOT_CATEGORIES) {
      for (const question of cat.questions) {
        const qTokens = tokenize(question);
        const score = calculateSimilarity(inputTokens, qTokens);
        if (score > maxScore) {
          maxScore = score;
          bestCategory = cat;
        }
      }
    }

    // 2. Hybrid fallback keyword contains matching if score is low
    if (maxScore <= 0.08) {
      for (const cat of BOT_CATEGORIES) {
        const matchedKeyword = cat.questions.some((q) => {
          const words = q.split(/\s+/);
          return words.some((w) => w.length > 3 && normalized.includes(w));
        });
        if (matchedKeyword) {
          bestCategory = cat;
          maxScore = 0.5;
          break;
        }
      }
    }

    // Check if user is asking about a specific product in our store catalog
    const matchingProduct = productsList.find((p) => 
      normalized.includes(p.name.toLowerCase()) || 
      normalized.includes(p.description.toLowerCase()) ||
      (p.brand && normalized.includes(p.brand.toLowerCase()))
    );

    if (matchingProduct) {
      return `Yes! We carry **${matchingProduct.name}** in stock.\n\n• **Price**: $${matchingProduct.price.toFixed(2)}\n• **Description**: ${matchingProduct.description}\n• **Category**: ${matchingProduct.category}\n\nWould you like to buy it? You can view it here: **[View Product](/collections/${matchingProduct.id})**!`;
    } else if (bestCategory && maxScore > 0.08) {
      if (bestCategory.id === "products") {
        if (productsList.length > 0) {
          const itemsText = productsList.slice(0, 5).map(p => `• **${p.name}** ($${p.price.toFixed(2)})`).join("\n");
          return `We currently offer these premium products in our catalog:\n\n${itemsText}\n\nYou can browse details, add products to your cart, or save to your wishlist on the **[Collections page](/collections)**!`;
        } else {
          return bestCategory.response;
        }
      } else if (bestCategory.id === "points") {
        if (userEmail) {
          const totalSpent = ordersList.reduce((sum, ord) => sum + ord.total, 0);
          const auraPoints = Math.floor(totalSpent * 5);
          return `Hi **${user?.name || "Customer"}**, you currently have **${auraPoints.toLocaleString()} Aura Points**!\n\nYou've spent a total of $${totalSpent.toFixed(2)} on our platform, earning 5 points for every dollar spent. Check out your points breakdown on your **[Dashboard](/dashboard)**.`;
        } else {
          return bestCategory.response;
        }
      } else if (bestCategory.id === "shipping" || normalized.includes("my order") || normalized.includes("track my")) {
        if (userEmail) {
          if (ordersList.length > 0) {
            const recentOrder = ordersList[0]; // newest order
            return `Your most recent order is **${recentOrder.orderId}**:\n\n• **Date**: ${recentOrder.date}\n• **Fulfillment Status**: **${recentOrder.fulfillmentStatus}**\n• **Payment Status**: **${recentOrder.paymentStatus}**\n• **Total**: $${recentOrder.total.toFixed(2)}\n\nYou can track and manage all your orders on your **[Orders Dashboard](/dashboard/orders)**!`;
          } else {
            return "You don't have any orders placed yet! Once you place an order, you'll be able to track its shipping status and estimated delivery dates right here.";
          }
        } else {
          return bestCategory.response;
        }
      } else {
        return bestCategory.response;
      }
    } else {
      return "I couldn't find a direct match for your question. Here is a list of topics I can assist you with:\n\n" +
        "• **Shop Products**: Our catalog items, pricing and collections page.\n" +
        "• **Loyalty Points**: Earning and tracking Aura Points.\n" +
        "• **Shipping**: Estimates and tracking orders.\n" +
        "• **Submit Reviews**: Submitting reviews with star ratings and photo uploads.\n" +
        "• **Payments**: Stripe card checkout and bKash mobile payments.\n" +
        "• **Returns**: Our 30-day free returns policy.\n\n" +
        "Try using simpler keywords or select one of the quick suggestions below!";
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";
      const response = await fetch(`${baseUrl}/chatbot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          email: userEmail,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to contact assistant.");
      }

      const botMessage: Message = {
        id: Math.random().toString(),
        sender: "bot",
        text: json.data,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error("Chatbot failed, falling back locally:", err);
      // Fallback locally
      const localReplyText = localChatbotFallback(text);
      const botMessage: Message = {
        id: Math.random().toString(),
        sender: "bot",
        text: localReplyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageText = (text: string) => {
    // Basic helper to convert markdown-like links [text](url) and bold **text** to HTML
    const boldRegex = /\*\*(.*?)\*\*/g;
    
    // Parse markdown links
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    let formattedText = text
      .replace(boldRegex, "<strong>$1</strong>")
      .replace(linkRegex, `<a href="$2" class="text-blue-600 dark:text-blue-455 hover:underline font-bold">$1</a>`);

    return (
      <div 
        className="whitespace-pre-line leading-relaxed text-xs" 
        dangerouslySetInnerHTML={{ __html: formattedText }} 
      />
    );
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* FLOATING ACTION TRIGGER BUBBLE — draggable */}
      {/* ========================================================================= */}
      <button
        ref={btnRef}
        onPointerDown={onBubblePointerDown}
        onPointerMove={onBubblePointerMove}
        onPointerUp={onBubblePointerUp}
        style={{ bottom: btnPos.bottom, right: btnPos.right }}
        className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-grab active:cursor-grabbing focus:outline-none select-none"
        title="Drag to move • Click to open LUXE Assistant"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="h-6.5 w-6.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>
        )}
      </button>

      {/* ========================================================================= */}
      {/* CHAT WIDGET MODAL PANEL */}
      {/* ========================================================================= */}
      {isOpen && (
        <div
          ref={panelRef}
          style={{
            bottom: btnPos.bottom + 64,
            right: btnPos.right,
          }}
          className="fixed z-50 w-[350px] max-w-[90vw] h-[500px] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl flex flex-col overflow-hidden animate-fade-in"
        >
          
          {/* Header section — no longer needs drag handlers */}
          <div className="bg-zinc-900 text-white px-5 py-4 flex items-center justify-between shadow-sm select-none">
            <div className="flex items-center gap-3">
              {/* Bot Avatar Icon */}
              <div className="h-9 w-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-600/35 flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wide uppercase">LUXE Assistant</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-semibold text-zinc-400">Online • Live Helper</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages list container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/25">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                {/* User/Bot Icon Avatar */}
                <div
                  className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center font-extrabold text-[10px] border ${
                    msg.sender === "user"
                      ? "bg-zinc-900 text-white border-zinc-800 dark:bg-white dark:text-zinc-950 dark:border-white"
                      : "bg-blue-600 text-white border-blue-500"
                  }`}
                >
                  {msg.sender === "user" ? "U" : "A"}
                </div>

                {/* Message bubble */}
                <div className="space-y-1">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 shadow-xs border ${
                      msg.sender === "user"
                        ? "bg-zinc-900 border-zinc-800 text-white rounded-tr-none dark:bg-white dark:text-zinc-950 dark:border-white"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-none"
                    }`}
                  >
                    {renderMessageText(msg.text)}
                  </div>
                  <span className="text-[9px] font-semibold text-zinc-400 block px-1">
                    {msg.timestamp.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing status indicator */}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="h-7 w-7 rounded-full bg-blue-600 border border-blue-500 text-white shrink-0 flex items-center justify-center font-extrabold text-[10px]">
                  A
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestion pills */}
          <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x select-none">
              {SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="snap-start rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 px-3.5 py-1.5 whitespace-nowrap shadow-2xs transition-colors cursor-pointer focus:outline-none"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Chat text input footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me something..."
              className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:hover:scale-100 hover:scale-103"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>

        </div>
      )}
    </>
  );
}
