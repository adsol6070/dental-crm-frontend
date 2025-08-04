// @ts-nocheck
import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  FiSave,
  FiX,
  FiDollarSign,
  FiClock,
  FiTag,
  FiFileText,
  FiImage,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { MdMedicalServices } from "react-icons/md";
import { ROUTES } from "@/config/route-paths.config";
import { theme } from "@/config/theme.config";
import Swal from "sweetalert2";

// Mock categories - replace with actual API
const mockCategories = [
  "General Dentistry",
  "Specialized Dental Services",
  "Cosmetic Dentistry",
  "Oral Surgery",
  "Emergency Services",
  "Orthodontics",
  "Periodontics",
];

interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  isActive: boolean;
  prerequisites: string[];
  instructions: {
    beforeTreatment: string[];
    afterTreatment: string[];
  };
  materials: string[];
  tags: string[];
  images: File[];
}

const AdminCreateService = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    category: "",
    price: 0,
    duration: 30,
    isActive: true,
    prerequisites: [],
    instructions: {
      beforeTreatment: [],
      afterTreatment: [],
    },
    materials: [],
    tags: [],
    images: [],
  });

  const [errors, setErrors] = useState<Partial<ServiceFormData>>({});
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newBeforeInstruction, setNewBeforeInstruction] = useState("");
  const [newAfterInstruction, setNewAfterInstruction] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [newTag, setNewTag] = useState("");

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const addToList = (
    listType: "prerequisites" | "materials" | "tags",
    value: string,
    setter: (value: string) => void
  ) => {
    if (!value.trim()) return;

    if (listType === "tags") {
      setFormData((prev) => ({
        ...prev,
        [listType]: [...prev[listType], value.trim()],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [listType]: [...prev[listType], value.trim()],
      }));
    }
    setter("");
  };

  const addInstruction = (
    type: "beforeTreatment" | "afterTreatment",
    value: string,
    setter: (value: string) => void
  ) => {
    if (!value.trim()) return;

    setFormData((prev) => ({
      ...prev,
      instructions: {
        ...prev.instructions,
        [type]: [...prev.instructions[type], value.trim()],
      },
    }));
    setter("");
  };

  const removeFromList = (
    listType: "prerequisites" | "materials" | "tags",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [listType]: prev[listType].filter((_, i) => i !== index),
    }));
  };

  const removeInstruction = (
    type: "beforeTreatment" | "afterTreatment",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      instructions: {
        ...prev.instructions,
        [type]: prev.instructions[type].filter((_, i) => i !== index),
      },
    }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newImages = Array.from(files).filter((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          title: "Invalid File Type",
          text: "Please upload only image files.",
          icon: "error",
        });
        return false;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: "File Too Large",
          text: "Please upload images smaller than 5MB.",
          icon: "error",
        });
        return false;
      }

      return true;
    });

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ServiceFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Service description is required";
    }

    if (!formData.category) {
      newErrors.category = "Service category is required";
    }

    if (formData.price <= 0) {
    //   newErrors.price = "Price must be greater than 0";
    }

    if (formData.duration <= 0) {
    //   newErrors.duration = "Duration must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fix the errors and try again.",
        icon: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual API call
      console.log("Creating service:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Swal.fire({
        title: "Success!",
        text: "Service has been created successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate(ROUTES.ADMIN.SERVICES_LIST);
    } catch (error) {
      console.error("Error creating service:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to create service. Please try again.",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.description || formData.category) {
      Swal.fire({
        title: "Discard Changes?",
        text: "You have unsaved changes. Are you sure you want to leave?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, discard changes",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(ROUTES.ADMIN.SERVICES_LIST);
        }
      });
    } else {
      navigate(ROUTES.ADMIN.SERVICES_LIST);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate basic info before proceeding
      const basicErrors: Partial<ServiceFormData> = {};
      if (!formData.name.trim()) basicErrors.name = "Service name is required";
      if (!formData.description.trim())
        basicErrors.description = "Service description is required";
      if (!formData.category)
        basicErrors.category = "Service category is required";
      if (formData.price <= 0)
        // basicErrors.price = "Price must be greater than 0";
      if (formData.duration <= 0)
        // basicErrors.duration = "Duration must be greater than 0";

      setErrors(basicErrors);
      if (Object.keys(basicErrors).length === 0) {
        setCurrentStep(2);
      }
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackLink onClick={handleCancel}>← Back to Services</BackLink>
          <Title>
            <MdMedicalServices size={28} />
            Add New Service
          </Title>
          <Subtitle>Create a new dental service for your clinic</Subtitle>
        </HeaderContent>
        <HeaderActions>
          <ActionButton
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <FiX size={16} />
            Cancel
          </ActionButton>
          <ActionButton onClick={handleSubmit} disabled={isLoading}>
            <FiSave size={16} />
            {isLoading ? "Creating..." : "Create Service"}
          </ActionButton>
        </HeaderActions>
      </Header>

      <StepIndicator>
        <Step active={currentStep >= 1} completed={currentStep > 1}>
          <StepNumber>1</StepNumber>
          <StepLabel>Basic Information</StepLabel>
        </Step>
        <StepConnector completed={currentStep > 1} />
        <Step active={currentStep >= 2} completed={currentStep > 2}>
          <StepNumber>2</StepNumber>
          <StepLabel>Details & Instructions</StepLabel>
        </Step>
        <StepConnector completed={currentStep > 2} />
        <Step active={currentStep >= 3}>
          <StepNumber>3</StepNumber>
          <StepLabel>Media & Final Review</StepLabel>
        </Step>
      </StepIndicator>

      <FormContainer>
        <Form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <StepContent>
              <SectionTitle>Basic Service Information</SectionTitle>

              <FormGrid>
                <FormGroup className="full-width">
                  <Label>
                    <FiTag size={14} />
                    Service Name *
                  </Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter service name (e.g., General Consultation)"
                    hasError={!!errors.name}
                  />
                  {errors.name && <ErrorText>{errors.name}</ErrorText>}
                </FormGroup>

                <FormGroup className="full-width">
                  <Label>
                    <FiFileText size={14} />
                    Description *
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe what this service includes, its benefits, and what patients can expect..."
                    rows={4}
                    hasError={!!errors.description}
                  />
                  {errors.description && (
                    <ErrorText>{errors.description}</ErrorText>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    hasError={!!errors.category}
                  >
                    <option value="">Select a category</option>
                    {mockCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                  {errors.category && <ErrorText>{errors.category}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FiDollarSign size={14} />
                    Price (INR) *
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) =>
                      handleInputChange(
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    hasError={!!errors.price}
                  />
                  {errors.price && <ErrorText>{errors.price}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FiClock size={14} />
                    Duration (minutes) *
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange(
                        "duration",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="30"
                    hasError={!!errors.duration}
                  />
                  {errors.duration && <ErrorText>{errors.duration}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Status</Label>
                  <StatusToggle>
                    <StatusOption>
                      <input
                        type="radio"
                        name="status"
                        checked={formData.isActive}
                        onChange={() => handleInputChange("isActive", true)}
                      />
                      <span>Active</span>
                    </StatusOption>
                    <StatusOption>
                      <input
                        type="radio"
                        name="status"
                        checked={!formData.isActive}
                        onChange={() => handleInputChange("isActive", false)}
                      />
                      <span>Inactive</span>
                    </StatusOption>
                  </StatusToggle>
                </FormGroup>
              </FormGrid>
            </StepContent>
          )}

          {currentStep === 2 && (
            <StepContent>
              <SectionTitle>Service Details & Instructions</SectionTitle>

              <DetailsGrid>
                <DetailSection>
                  <DetailSectionTitle>Prerequisites</DetailSectionTitle>
                  <DetailSectionDescription>
                    List any requirements or conditions patients should meet
                    before this service
                  </DetailSectionDescription>

                  <AddItemContainer>
                    <AddItemInput
                      type="text"
                      value={newPrerequisite}
                      onChange={(e) => setNewPrerequisite(e.target.value)}
                      placeholder="Add a prerequisite (e.g., Consultation required)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addToList(
                            "prerequisites",
                            newPrerequisite,
                            setNewPrerequisite
                          );
                        }
                      }}
                    />
                    <AddButton
                      type="button"
                      onClick={() =>
                        addToList(
                          "prerequisites",
                          newPrerequisite,
                          setNewPrerequisite
                        )
                      }
                    >
                      <FiPlus size={16} />
                    </AddButton>
                  </AddItemContainer>

                  <ItemList>
                    {formData.prerequisites.map((prerequisite, index) => (
                      <ListItem key={index}>
                        <span>{prerequisite}</span>
                        <RemoveButton
                          type="button"
                          onClick={() => removeFromList("prerequisites", index)}
                        >
                          <FiMinus size={14} />
                        </RemoveButton>
                      </ListItem>
                    ))}
                  </ItemList>
                </DetailSection>

                <DetailSection>
                  <DetailSectionTitle>Materials Required</DetailSectionTitle>
                  <DetailSectionDescription>
                    List materials or equipment needed for this service
                  </DetailSectionDescription>

                  <AddItemContainer>
                    <AddItemInput
                      type="text"
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                      placeholder="Add a material (e.g., Local anesthesia)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addToList("materials", newMaterial, setNewMaterial);
                        }
                      }}
                    />
                    <AddButton
                      type="button"
                      onClick={() =>
                        addToList("materials", newMaterial, setNewMaterial)
                      }
                    >
                      <FiPlus size={16} />
                    </AddButton>
                  </AddItemContainer>

                  <ItemList>
                    {formData.materials.map((material, index) => (
                      <ListItem key={index}>
                        <span>{material}</span>
                        <RemoveButton
                          type="button"
                          onClick={() => removeFromList("materials", index)}
                        >
                          <FiMinus size={14} />
                        </RemoveButton>
                      </ListItem>
                    ))}
                  </ItemList>
                </DetailSection>

                <DetailSection>
                  <DetailSectionTitle>
                    Before Treatment Instructions
                  </DetailSectionTitle>
                  <DetailSectionDescription>
                    Instructions for patients to follow before the treatment
                  </DetailSectionDescription>

                  <AddItemContainer>
                    <AddItemInput
                      type="text"
                      value={newBeforeInstruction}
                      onChange={(e) => setNewBeforeInstruction(e.target.value)}
                      placeholder="Add instruction (e.g., Avoid eating 2 hours before)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addInstruction(
                            "beforeTreatment",
                            newBeforeInstruction,
                            setNewBeforeInstruction
                          );
                        }
                      }}
                    />
                    <AddButton
                      type="button"
                      onClick={() =>
                        addInstruction(
                          "beforeTreatment",
                          newBeforeInstruction,
                          setNewBeforeInstruction
                        )
                      }
                    >
                      <FiPlus size={16} />
                    </AddButton>
                  </AddItemContainer>

                  <ItemList>
                    {formData.instructions.beforeTreatment.map(
                      (instruction, index) => (
                        <ListItem key={index}>
                          <span>{instruction}</span>
                          <RemoveButton
                            type="button"
                            onClick={() =>
                              removeInstruction("beforeTreatment", index)
                            }
                          >
                            <FiMinus size={14} />
                          </RemoveButton>
                        </ListItem>
                      )
                    )}
                  </ItemList>
                </DetailSection>

                <DetailSection>
                  <DetailSectionTitle>
                    After Treatment Instructions
                  </DetailSectionTitle>
                  <DetailSectionDescription>
                    Post-treatment care instructions for patients
                  </DetailSectionDescription>

                  <AddItemContainer>
                    <AddItemInput
                      type="text"
                      value={newAfterInstruction}
                      onChange={(e) => setNewAfterInstruction(e.target.value)}
                      placeholder="Add instruction (e.g., Apply ice for 20 minutes)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addInstruction(
                            "afterTreatment",
                            newAfterInstruction,
                            setNewAfterInstruction
                          );
                        }
                      }}
                    />
                    <AddButton
                      type="button"
                      onClick={() =>
                        addInstruction(
                          "afterTreatment",
                          newAfterInstruction,
                          setNewAfterInstruction
                        )
                      }
                    >
                      <FiPlus size={16} />
                    </AddButton>
                  </AddItemContainer>

                  <ItemList>
                    {formData.instructions.afterTreatment.map(
                      (instruction, index) => (
                        <ListItem key={index}>
                          <span>{instruction}</span>
                          <RemoveButton
                            type="button"
                            onClick={() =>
                              removeInstruction("afterTreatment", index)
                            }
                          >
                            <FiMinus size={14} />
                          </RemoveButton>
                        </ListItem>
                      )
                    )}
                  </ItemList>
                </DetailSection>
              </DetailsGrid>
            </StepContent>
          )}

          {currentStep === 3 && (
            <StepContent>
              <SectionTitle>Media & Final Review</SectionTitle>

              <FinalGrid>
                <MediaSection>
                  <DetailSectionTitle>Service Images</DetailSectionTitle>
                  <DetailSectionDescription>
                    Upload images to showcase this service (optional)
                  </DetailSectionDescription>

                  <ImageUploadArea>
                    <input
                      type="file"
                      id="imageUpload"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      style={{ display: "none" }}
                    />
                    <ImageUploadButton
                      type="button"
                      onClick={() =>
                        document.getElementById("imageUpload")?.click()
                      }
                    >
                      <FiImage size={24} />
                      <span>Upload Images</span>
                      <small>PNG, JPG up to 5MB each</small>
                    </ImageUploadButton>
                  </ImageUploadArea>

                  {formData.images.length > 0 && (
                    <ImagePreviewGrid>
                      {formData.images.map((image, index) => (
                        <ImagePreview key={index}>
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Service image ${index + 1}`}
                          />
                          <ImageRemoveButton
                            type="button"
                            onClick={() => removeImage(index)}
                          >
                            <FiX size={16} />
                          </ImageRemoveButton>
                        </ImagePreview>
                      ))}
                    </ImagePreviewGrid>
                  )}
                </MediaSection>

                <TagsSection>
                  <DetailSectionTitle>Tags</DetailSectionTitle>
                  <DetailSectionDescription>
                    Add tags to help categorize and search for this service
                  </DetailSectionDescription>

                  <AddItemContainer>
                    <AddItemInput
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag (e.g., painless, quick)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addToList("tags", newTag, setNewTag);
                        }
                      }}
                    />
                    <AddButton
                      type="button"
                      onClick={() => addToList("tags", newTag, setNewTag)}
                    >
                      <FiPlus size={16} />
                    </AddButton>
                  </AddItemContainer>

                  <TagList>
                    {formData.tags.map((tag, index) => (
                      <Tag key={index}>
                        {tag}
                        <TagRemoveButton
                          type="button"
                          onClick={() => removeFromList("tags", index)}
                        >
                          <FiX size={12} />
                        </TagRemoveButton>
                      </Tag>
                    ))}
                  </TagList>
                </TagsSection>

                <ReviewSection>
                  <DetailSectionTitle>Service Summary</DetailSectionTitle>
                  <SummaryCard>
                    <SummaryRow>
                      <SummaryLabel>Name:</SummaryLabel>
                      <SummaryValue>
                        {formData.name || "Not specified"}
                      </SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>Category:</SummaryLabel>
                      <SummaryValue>
                        {formData.category || "Not specified"}
                      </SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>Price:</SummaryLabel>
                      <SummaryValue>
                        ₹{formData.price.toLocaleString()}
                      </SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>Duration:</SummaryLabel>
                      <SummaryValue>{formData.duration} minutes</SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>Status:</SummaryLabel>
                      <SummaryValue>
                        <StatusBadge active={formData.isActive}>
                          {formData.isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                      </SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>Prerequisites:</SummaryLabel>
                      <SummaryValue>
                        {formData.prerequisites.length} items
                      </SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>Materials:</SummaryLabel>
                      <SummaryValue>
                        {formData.materials.length} items
                      </SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>Images:</SummaryLabel>
                      <SummaryValue>
                        {formData.images.length} uploaded
                      </SummaryValue>
                    </SummaryRow>
                  </SummaryCard>
                </ReviewSection>
              </FinalGrid>
            </StepContent>
          )}
        </Form>
      </FormContainer>

      <NavigationButtons>
        {currentStep > 1 && (
          <NavButton
            variant="secondary"
            onClick={prevStep}
            disabled={isLoading}
          >
            Previous Step
          </NavButton>
        )}
        <div style={{ flex: 1 }} />
        {currentStep < 3 ? (
          <NavButton onClick={nextStep} disabled={isLoading}>
            Next Step
          </NavButton>
        ) : (
          <NavButton onClick={handleSubmit} disabled={isLoading}>
            <FiSave size={16} />
            {isLoading ? "Creating Service..." : "Create Service"}
          </NavButton>
        )}
      </NavigationButtons>

      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>Creating service...</LoadingText>
        </LoadingOverlay>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #6366f1 100%);
  color: white;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div``;

const BackLink = styled.button`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ActionButton = styled.button<{ variant?: "secondary" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.variant === "secondary"
      ? `
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.25);
    }
  `
      : `
    background: white;
    color: ${theme.colors.primary};
    &:hover:not(:disabled) {
      background: #f9fafb;
      transform: translateY(-1px);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const Step = styled.div<{ active: boolean; completed?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const StepNumber = styled.div<{ active?: boolean; completed?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  background: ${(props) =>
    props.completed
      ? theme.colors.success
      : props.active
      ? theme.colors.primary
      : "#e5e7eb"};
  color: ${(props) => (props.completed || props.active ? "white" : "#6b7280")};
  transition: all 0.2s;
`;

const StepLabel = styled.span<{ active?: boolean; completed?: boolean }>`
  font-size: 12px;
  font-weight: 500;
  color: ${(props) =>
    props.completed
      ? theme.colors?.success
      : props.active
      ? theme.colors.primary
      : "#6b7280"};
  text-align: center;
`;

const StepConnector = styled.div<{ completed?: boolean }>`
  width: 60px;
  height: 2px;
  background: ${(props) =>
    props.completed ? theme.colors?.success : "#e5e7eb"};
  margin: 0 16px;
  transition: background-color 0.2s;
`;

const FormContainer = styled.div`
  padding: 32px 24px;
`;

const Form = styled.form``;

const StepContent = styled.div``;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;

  .full-width {
    grid-column: 1 / -1;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 12px;
  border: 1px solid ${(props) => (props.hasError ? "#ef4444" : "#d1d5db")};
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.hasError ? "#ef4444" : theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${(props) => (props.hasError ? "#ef444420" : `${theme.colors.primary}20`)};
  }
`;

const Textarea = styled.textarea<{ hasError?: boolean }>`
  padding: 12px;
  border: 1px solid ${(props) => (props.hasError ? "#ef4444" : "#d1d5db")};
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.hasError ? "#ef4444" : theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${(props) => (props.hasError ? "#ef444420" : `${theme.colors.primary}20`)};
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  padding: 12px;
  border: 1px solid ${(props) => (props.hasError ? "#ef4444" : "#d1d5db")};
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.hasError ? "#ef4444" : theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${(props) => (props.hasError ? "#ef444420" : `${theme.colors.primary}20`)};
  }
`;

const StatusToggle = styled.div`
  display: flex;
  gap: 16px;
`;

const StatusOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  input[type="radio"] {
    margin: 0;
  }

  span {
    font-size: 14px;
    color: #374151;
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #ef4444;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const DetailSection = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
`;

const DetailSectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
`;

const DetailSectionDescription = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.4;
`;

const AddItemContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const AddItemInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}20;
  }
`;

const AddButton = styled.button`
  padding: 8px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${theme.colors.primary}dd;
  }
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;
`;

const RemoveButton = styled.button`
  padding: 4px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.1s;

  &:hover {
    background: #fecaca;
  }
`;

const FinalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MediaSection = styled.div`
  grid-column: 1 / -1;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
`;

const ImageUploadArea = styled.div`
  margin-bottom: 16px;
`;

const ImageUploadButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 32px;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }

  small {
    font-size: 11px;
    opacity: 0.7;
  }
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
`;

const ImagePreview = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImageRemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const TagsSection = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const TagRemoveButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #dc2626;
  }
`;

const ReviewSection = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
`;

const SummaryCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const SummaryLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
`;

const SummaryValue = styled.span`
  font-size: 13px;
  color: #111827;
  font-weight: 500;
`;

const StatusBadge = styled.span<{ active: boolean }>`
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: ${(props) => (props.active ? "#d1fae5" : "#fee2e2")};
  color: ${(props) => (props.active ? "#065f46" : "#991b1b")};
`;

const NavigationButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const NavButton = styled.button<{ variant?: "secondary" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.variant === "secondary"
      ? `
    background: #e5e7eb;
    color: #374151;
    &:hover:not(:disabled) {
      background: #d1d5db;
    }
  `
      : `
    background: ${theme.colors.primary};
    color: white;
    &:hover:not(:disabled) {
      background: ${theme.colors.primary}dd;
      transform: translateY(-1px);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  margin-top: 12px;
  color: #6b7280;
  font-size: 14px;
`;

export default AdminCreateService;
