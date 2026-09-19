import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Transaction, TransactionType, PaymentMethod } from "../types";
import { DEFAULT_CATEGORIES, PAYMENT_METHODS } from "../data/initialData";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, "id" | "createdAt">, id?: string) => void;
  editingTransaction?: Transaction | null;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("খাবার");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("নগদ");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNote(editingTransaction.note);
    } else {
      setType("expense");
      setAmount("");
      setCategory("খাবার");
      setDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("নগদ");
      setNote("");
    }
    setError("");
  }, [editingTransaction, isOpen]);

  // When type changes, adjust default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === "income") {
      setCategory("বেতন");
    } else {
      setCategory("খাবার");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("সঠিক টাকার পরিমাণ লিখুন (যেমন: ৳৫০০)");
      return;
    }
    if (!category) {
      setError("একটি ক্যাটাগরি নির্বাচন করুন");
      return;
    }

    onSave(
      {
        type,
        amount: parsedAmount,
        category,
        date: date || new Date().toISOString().split("T")[0],
        paymentMethod,
        note: note.trim() || category,
      },
      editingTransaction?.id
    );

    onClose();
  };

  const filteredCategories = DEFAULT_CATEGORIES.filter(
    (c) => c.type === type || c.type === "both"
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTransaction ? "লেনদেন পরিবর্তন করুন" : "নতুন লেনদেন যুক্ত করুন"}
      description="আপনার দৈনিক আয় বা ব্যয়ের সঠিক তথ্য সংরক্ষণ করুন"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-lg">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`py-2 text-xs font-semibold rounded-md transition-all ${
              type === "expense"
                ? "bg-white text-rose-600 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            খরচ (Expense)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={`py-2 text-xs font-semibold rounded-md transition-all ${
              type === "income"
                ? "bg-white text-emerald-600 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            আয় (Income)
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            টাকার পরিমাণ (৳) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
              ৳
            </span>
            <Input
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 text-base font-semibold text-zinc-900"
              autoFocus
            />
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            ক্যাটাগরি নির্বাচন করুন *
          </label>
          <div className="grid grid-cols-2 xs:grid-cols-3 gap-1.5 max-h-44 overflow-y-auto p-1 border border-zinc-200 rounded-lg bg-zinc-50/50">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.name)}
                className={`flex items-center justify-center p-2 rounded-md text-xs font-medium transition-all ${
                  category === cat.name
                    ? "bg-zinc-900 text-white shadow-xs font-semibold"
                    : "bg-white text-zinc-700 border border-zinc-200/80 hover:bg-zinc-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              তারিখ
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              পেমেন্ট মাধ্যম
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Note / Description */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            নোট বা বিবরণ (ঐচ্ছিক)
          </label>
          <Input
            type="text"
            placeholder="যেমন: রাতের ডিনার, অফিসের চা-নাস্তা, বই মেলা..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-md p-2">
            {error}
          </p>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
            বাতিল
          </Button>
          <Button
            type="submit"
            variant="default"
            className={`flex-1 sm:flex-initial ${type === "expense" ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
          >
            {editingTransaction ? "আপডেট করুন" : "সংরক্ষণ করুন"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
