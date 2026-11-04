"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePartner } from "../../../hooks/usePartner";
import { ArrowLeft, Upload, X, Building2, User } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Button } from "../../../components/ui/Button";

export default function CreatePartnerPage() {
  const router = useRouter();
  const { createPartner, loading } = usePartner();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "",
    businessAddress: "",
    description: "",
    website: "",
    partnerType: "business" as "individual" | "business",
    isActive: true,
  });

  const [socialLinks, setSocialLinks] = useState<string[]>([""]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...socialLinks];
    newLinks[index] = value;
    setSocialLinks(newLinks);
  };

  const addSocialLink = () => setSocialLinks([...socialLinks, ""]);
  const removeSocialLink = (index: number) => setSocialLinks(socialLinks.filter((_, i) => i !== index));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "socialLinks") {
          formDataToSend.append(key, value.toString());
        }
      });

      const validSocialLinks = socialLinks.filter((link) => link.trim() !== "");
      validSocialLinks.forEach((link) => {
        formDataToSend.append("socialLinks[]", link);
      });

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const result = await createPartner(formDataToSend);

      if (result) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/partners");
        }, 1500);
      } else {
        setSubmitError("Failed to create partner. Please try again.");
      }
    } catch (error: any) {
      console.error("Create partner error:", error);
      setSubmitError(error.response?.data?.message || error.message || "An error occurred while creating the partner");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-2xl font-bold text-on-surface">Create New Partner</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Add a new partner to your network.</p>
      </div>

      {submitSuccess && (
        <div className="rounded-2xl border border-tertiary-fixed bg-tertiary-fixed/20 px-4 py-3 text-sm text-on-tertiary-fixed-variant">
          ✓ Partner created successfully! Redirecting...
        </div>
      )}
      {submitError && (
        <div className="rounded-2xl border border-error-container bg-error-container px-4 py-3 text-sm text-on-error-container">
          {submitError}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-semibold text-on-surface">Partner Type *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, partnerType: "business" })}
                className={`flex items-center gap-3 rounded-2xl border-2 p-4 transition-colors ${
                  formData.partnerType === "business" ? "border-primary bg-primary-fixed/30" : "border-surface-variant hover:border-outline"
                }`}
              >
                <Building2 size={24} className={formData.partnerType === "business" ? "text-primary" : "text-on-surface-variant"} />
                <div className="text-left">
                  <div className="font-semibold text-on-surface">Business</div>
                  <div className="text-xs text-on-surface-variant">Company or Organization</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, partnerType: "individual" })}
                className={`flex items-center gap-3 rounded-2xl border-2 p-4 transition-colors ${
                  formData.partnerType === "individual" ? "border-primary bg-primary-fixed/30" : "border-surface-variant hover:border-outline"
                }`}
              >
                <User size={24} className={formData.partnerType === "individual" ? "text-primary" : "text-on-surface-variant"} />
                <div className="text-left">
                  <div className="font-semibold text-on-surface">Individual</div>
                  <div className="text-xs text-on-surface-variant">Person or Professional</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">Partner Image</label>
            {imagePreview ? (
              <div className="relative h-40 w-40 overflow-hidden rounded-2xl border-2 border-surface-variant">
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-2 top-2 rounded-full bg-error p-1 text-on-error hover:opacity-90"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-variant transition-colors hover:border-primary">
                <Upload size={32} className="mb-2 text-outline" />
                <span className="text-sm text-on-surface-variant">Upload Image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
            <p className="mt-2 text-xs text-on-surface-variant">Max size: 5MB</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Name *"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              maxLength={100}
              placeholder="Enter partner name"
            />
            <Input
              label="Profession *"
              name="profession"
              value={formData.profession}
              onChange={handleInputChange}
              required
              maxLength={100}
              placeholder="e.g., Healthcare Provider"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="email@example.com"
            />
            <div>
              <Input
                label="Phone *"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+2348012345678"
              />
              <p className="mt-1 pl-4 text-xs text-on-surface-variant">Format: +2348012345678 or 08012345678</p>
            </div>
          </div>

          <Input
            label="Business Address *"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleInputChange}
            required
            maxLength={300}
            placeholder="Enter full business address"
          />

          <Input
            label="Website"
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://www.example.com"
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">Social Links</label>
            <div className="space-y-2">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="url"
                      value={link}
                      onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  {socialLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="rounded-full px-3 text-error transition-colors hover:bg-error-container"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addSocialLink} className="mt-2 text-sm font-semibold text-primary hover:underline">
              + Add Another Social Link
            </button>
          </div>

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            maxLength={1000}
            rows={4}
            placeholder="Brief description about the partner..."
          />
          <p className="-mt-4 pl-4 text-xs text-on-surface-variant">{formData.description.length}/1000 characters</p>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-5 w-5 rounded border-outline text-primary focus:ring-primary"
            />
            <span className="text-sm font-semibold text-on-surface">Set as Active Partner</span>
          </label>

          <div className="flex gap-4 border-t border-surface-variant pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Partner"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
