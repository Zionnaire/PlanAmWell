"use client";

import React, { useState, useEffect } from "react";
import { Box, TextField, Button } from "@mui/material";
import toast from "react-hot-toast";
import { Partner } from "../types/partner";

interface PartnerFormProps {
  initialData?: Partner;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel?: () => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    website: initialData?.website || "",
    logo: null as File | null,
  });

  const [errors, setErrors] = useState<{ name?: string; website?: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        website: initialData.website || "",
        logo: null,
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: { name?: string; website?: string } = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.website.trim()) newErrors.website = "Website is required";
    else if (!/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = "Website must start with http:// or https://";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "logo" && files) {
      setFormData((prev) => ({ ...prev, logo: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Remove error as user types
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const data = new FormData();
    data.append("name", formData.name);
    data.append("website", formData.website);
    if (formData.logo) data.append("logo", formData.logo);

    try {
      await onSubmit(data);
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Box>
      <TextField
        label="Name"
        name="name"
        fullWidth
        margin="normal"
        value={formData.name}
        onChange={handleChange}
        error={!!errors.name}
        helperText={errors.name}
      />
      <TextField
        label="Website"
        name="website"
        fullWidth
        margin="normal"
        value={formData.website}
        onChange={handleChange}
        error={!!errors.website}
        helperText={errors.website}
      />
      <input type="file" name="logo" onChange={handleChange} style={{ marginTop: "10px" }} />

      <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {initialData ? "Update" : "Create"}
        </Button>
      </Box>
    </Box>
  );
};

export default PartnerForm;
