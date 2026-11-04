"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePartner } from "../../../hooks/usePartner";
import { Partner } from "../../../types/partner";
import { ArrowLeft, Upload, X, Building2, User, Trash2, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";

function PartnerEdit() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchPartnerById, updatePartner, togglePartnerStatus, deletePartner, loading } = usePartner();

  const [partner, setPartner] = useState<Partner | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "",
    businessAddress: "",
    description: "",
    website: "",
    partnerType: "business" as "individual" | "business" | string,
    isActive: true,
  });

  const [socialLinks, setSocialLinks] = useState<string[]>([""]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const partnerId = searchParams.get("id");

  useEffect(() => {
    const loadPartner = async () => {
      if (!partnerId) return;

      setPageLoading(true);
      try {
        const data = await fetchPartnerById(partnerId);
        if (data) {
          setPartner(data);

          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            profession: data.profession || "",
            businessAddress: data.businessAddress || "",
            description: data.description || "",
            website: data.website || "",
            partnerType: data.partnerType || "business" || "",
            isActive: data.isActive !== undefined ? data.isActive : true,
          });

          if (data.socialLinks && Array.isArray(data.socialLinks) && data.socialLinks.length > 0) {
            setSocialLinks(data.socialLinks);
          } else {
            setSocialLinks([""]);
          }

          if (data.partnerImage?.publicId || data.partnerImage?.url) {
            setImagePreview(data.partnerImage.url || null);
          }
        }
      } catch (error: any) {
        console.error("Failed to load partner:", error);
        setSubmitError("Failed to load partner details");
      } finally {
        setPageLoading(false);
      }
    };

    loadPartner();
  }, [partnerId, fetchPartnerById]);

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
    setImagePreview(partner?.partnerImage?.publicId || partner?.partnerImage?.url || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId) return;

    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      const validSocialLinks = socialLinks.filter((link) => link.trim() !== "");
      validSocialLinks.forEach((link) => {
        formDataToSend.append("socialLinks[]", link);
      });

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const result = await updatePartner(partnerId, formDataToSend);

      if (result) {
        setSubmitSuccess(true);
        setPartner(result);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setSubmitError("Failed to update partner. Please try again.");
      }
    } catch (error: any) {
      console.error("Update partner error:", error);
      setSubmitError(error.response?.data?.message || error.message || "An error occurred while updating the partner");
    }
  };

  const handleToggleStatus = async () => {
    if (!partnerId) return;

    try {
      const result = await togglePartnerStatus(partnerId);
      if (result) {
        setPartner(result);
        setFormData((prev) => ({ ...prev, isActive: result.isActive }));
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 2000);
      }
    } catch (error: any) {
      console.error("Toggle status error:", error);
      setSubmitError("Failed to toggle partner status");
    }
  };

  const handleDelete = async () => {
    if (!partnerId) return;

    try {
      const success = await deletePartner(partnerId);
      if (success) {
        router.push("/dashboard/partners");
      } else {
        setSubmitError("Failed to delete partner");
      }
    } catch (error: any) {
      console.error("Delete partner error:", error);
      setSubmitError("Failed to delete partner");
    }
  };

  if (pageLoading) return <p className="text-on-surface-variant">Loading partner...</p>;

  if (!partner) {
    return (
      <div className="rounded-2xl border border-error-container bg-error-container px-4 py-3 text-on-error-container">
        Partner not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
        >
          <ArrowLeft size={18} /> Back to Partners
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Edit Partner</h1>
            <p className="mt-1 text-sm text-on-surface-variant">Update partner information.</p>
          </div>
          <Badge tone={formData.isActive ? "success" : "error"}>{formData.isActive ? "Active" : "Inactive"}</Badge>
        </div>
      </div>

      {submitSuccess && (
        <div className="rounded-2xl border border-tertiary-fixed bg-tertiary-fixed/20 px-4 py-3 text-sm text-on-tertiary-fixed-variant">
          ✓ Partner updated successfully!
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
            <label className="mb-3 block text-sm font-semibold text-on-surface">Partner Type</label>
            <div className="flex items-center gap-3 rounded-2xl border-2 border-surface-variant bg-surface-container-low p-4">
              {formData.partnerType === "business" ? (
                <>
                  <Building2 size={24} className="text-on-surface-variant" />
                  <div>
                    <div className="font-semibold text-on-surface">Business</div>
                    <div className="text-xs text-on-surface-variant">Company or Organization</div>
                  </div>
                </>
              ) : (
                <>
                  <User size={24} className="text-on-surface-variant" />
                  <div>
                    <div className="font-semibold text-on-surface">Individual</div>
                    <div className="text-xs text-on-surface-variant">Person or Professional</div>
                  </div>
                </>
              )}
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
            <p className="mt-2 text-xs text-on-surface-variant">Max size: 5MB. Leave unchanged to keep current image.</p>
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

          <div className="flex flex-wrap gap-4 border-t border-surface-variant pt-4">
            <Button type="submit" disabled={loading}>
              <Save size={18} />
              {loading ? "Saving..." : "Save Changes"}
            </Button>

            <Button type="button" variant="outline" onClick={handleToggleStatus} disabled={loading}>
              {formData.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {formData.isActive ? "Deactivate" : "Activate"}
            </Button>

            <Button
              type="button"
              variant="danger"
              className="ml-auto"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
            >
              <Trash2 size={18} /> Delete Partner
            </Button>
          </div>
        </form>
      </Card>

      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Partner">
        <p className="mb-6 text-sm text-on-surface-variant">
          Are you sure you want to delete <strong>{partner.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              setShowDeleteConfirm(false);
              handleDelete();
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function PartnerEditPage() {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Loading partner...</p>}>
      <PartnerEdit />
    </Suspense>
  );
}
