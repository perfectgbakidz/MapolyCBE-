import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ApiError } from '../services/apiClient';
import { ChildMatch } from '../types';
import {
  Users,
  User,
  Phone,
  Home,
  Lock,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';

export const ParentRegisterPage: React.FC = () => {
  const { navigate } = useRouter();
  const { registerParent } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [childrenNames, setChildrenNames] = useState<string[]>(['']);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success matching state modal/card
  const [matchSummary, setMatchSummary] = useState<ChildMatch[] | null>(null);

  const handleAddChildField = () => {
    setChildrenNames((prev) => [...prev, '']);
  };

  const handleRemoveChildField = (index: number) => {
    if (childrenNames.length <= 1) return;
    setChildrenNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChildNameChange = (index: number, value: string) => {
    setChildrenNames((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const validateClientSide = (): boolean => {
    const errors: Record<string, string> = {};

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errors.full_name = 'Parent/Guardian full name is required.';
    } else if (trimmedName.length < 2 || trimmedName.length > 100) {
      errors.full_name = 'Name must be between 2 and 100 characters.';
    }

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) {
      errors.phone_number = 'Active phone number is required.';
    } else if (trimmedPhone.length < 7 || trimmedPhone.length > 20) {
      errors.phone_number = 'Please enter a valid phone number (min 7 digits).';
    }

    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      errors.address = 'Residential address is required.';
    } else if (trimmedAddress.length < 5) {
      errors.address = 'Please enter a complete residential address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8 || password.length > 128) {
      errors.password = 'Password must be between 8 and 128 characters.';
    }

    if (password !== confirmPassword) {
      errors.confirm_password = 'Passwords do not match.';
    }

    const validChildren = childrenNames.map((n) => n.trim()).filter(Boolean);
    if (validChildren.length === 0) {
      errors.children = 'Please enter at least one child/ward full name.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!validateClientSide()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const validChildren = childrenNames.map((n) => n.trim()).filter(Boolean);
      const res = await registerParent({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        address: address.trim(),
        password,
        children_names: validChildren,
      });

      const matchedCount = (res.children || []).filter((c) => c.matched).length;
      success('Parent Account Registered', `Successfully matched and linked ${matchedCount} child(ren).`);
      
      // If we got matching summary, display to parent then navigate
      setMatchSummary(res.children || []);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 400 && err.message.toLowerCase().includes('match')) {
          setFormError('None of the provided student names match a candidate currently registered in the examination portal. Please verify the exact registered full name.');
        } else if (err.status === 409) {
          setFormError('A parent account is already registered with this phone number.');
        } else {
          setFormError(err.message);
        }
      } else {
        const msg = err instanceof Error ? err.message : 'Registration failed. Please check network connection.';
        setFormError(msg);
        error('Registration Failed', msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div
          id="parent_register_card"
          className="w-full max-w-xl bg-white border border-stone-200 rounded-2xl shadow-md p-6 sm:p-8 animate-fadeIn"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 mx-auto mb-3 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Parent & Guardian Registration
            </h1>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Register as a parent or legal guardian to monitor your children&apos;s exam status, results, and academic integrity.
            </p>
          </div>

          {/* Match Summary Modal / Confirmation */}
          {matchSummary && (
            <div className="mb-6 p-5 bg-indigo-50 border border-indigo-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3 text-indigo-900 font-bold">
                <CheckCircle2 className="w-5 h-5 text-indigo-700" />
                <span>Account Verified & Children Linked</span>
              </div>
              <p className="text-xs text-indigo-800 mb-4">
                The portal cross-referenced your submitted student names against the Mapoly student registry:
              </p>
              <div className="space-y-2 mb-5">
                {matchSummary.map((child, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                      child.matched
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div>
                      <span className="font-bold">{child.name_submitted}</span>
                      {child.matric_no && (
                        <span className="ml-2 font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300">
                          {child.matric_no}
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        child.matched ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {child.matched ? 'Linked Successfully' : 'Not Found in Registry'}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                id="parent_goto_dashboard_btn"
                onClick={() => navigate('/parent/dashboard')}
                className="w-full py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
              >
                <span>Proceed to Parent Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form Level Error */}
          {formError && !matchSummary && (
            <div
              id="parent_register_error_banner"
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs animate-shake"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{formError}</div>
            </div>
          )}

          {!matchSummary && (
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              {/* Parent Full Name */}
              <div>
                <label htmlFor="parent_full_name" className="block text-xs font-bold text-stone-700 mb-1">
                  Parent / Guardian Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="parent_full_name"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chief Adeleke Balogun"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                  />
                </div>
                {fieldErrors.full_name && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.full_name}</p>
                )}
              </div>

              {/* Phone Number & Address Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parent_phone_number" className="block text-xs font-bold text-stone-700 mb-1">
                    Phone Number (Login ID) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      id="parent_phone_number"
                      name="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 08023456789"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                    />
                  </div>
                  {fieldErrors.phone_number && (
                    <p className="text-[11px] text-red-600 mt-1">{fieldErrors.phone_number}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="parent_address" className="block text-xs font-bold text-stone-700 mb-1">
                    Residential Address *
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="parent_address"
                      name="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 12 Ibara Housing Estate, Abeokuta"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                    />
                  </div>
                  {fieldErrors.address && (
                    <p className="text-[11px] text-red-600 mt-1">{fieldErrors.address}</p>
                  )}
                </div>
              </div>

              {/* Children / Wards Dynamic Input Section */}
              <div className="pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-700" />
                    <span>Children / Wards Full Names *</span>
                  </label>
                  <button
                    type="button"
                    id="parent_add_child_btn"
                    onClick={handleAddChildField}
                    className="text-xs text-indigo-700 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Ward</span>
                  </button>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl mb-3 flex items-start gap-2 text-xs text-amber-900">
                  <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Provide the <strong>exact full registered name</strong> of each child as entered on their MAPOLY student record. At least one child name must match an active candidate in the database to link your account.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {childrenNames.map((name, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          id={`child_name_input_${index}`}
                          value={name}
                          onChange={(e) => handleChildNameChange(index, e.target.value)}
                          placeholder={index === 0 ? 'e.g. Ayomide Balogun' : `Ward ${index + 1} full name`}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                        />
                      </div>
                      {childrenNames.length > 1 && (
                        <button
                          type="button"
                          id={`remove_child_btn_${index}`}
                          onClick={() => handleRemoveChildField(index)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove this ward"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {fieldErrors.children && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.children}</p>
                )}
              </div>

              {/* Password & Confirm Password */}
              <div className="pt-2 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parent_password" className="block text-xs font-bold text-stone-700 mb-1">
                    Create Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      id="parent_password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                    />
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] text-red-600 mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="parent_confirm_password" className="block text-xs font-bold text-stone-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      id="parent_confirm_password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                    />
                  </div>
                  {fieldErrors.confirm_password && (
                    <p className="text-[11px] text-red-600 mt-1">{fieldErrors.confirm_password}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="parent_register_submit_btn"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm shadow-sm transition hover:shadow disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying & Linking Wards...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Register Parent Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Switch to Login / Candidate */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
            <div className="text-stone-600">
              Already registered as a parent?{' '}
              <button
                type="button"
                id="parent_login_switch_btn"
                onClick={() => navigate('/parent/login')}
                className="text-indigo-700 hover:text-indigo-900 font-bold underline"
              >
                Parent Sign In
              </button>
            </div>
            <button
              type="button"
              id="parent_candidate_portal_btn"
              onClick={() => navigate('/login')}
              className="text-stone-500 hover:text-stone-800"
            >
              Candidate Portal &rarr;
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
