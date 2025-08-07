// @ts-nocheck
import React, { useState, useMemo } from "react";
import styled from "styled-components";
import {
  useAllMedicines,
  useCreateMedicine,
  useUpdateMedicine,
  useDeleteMedicine,
} from "@/hooks/useAdmin";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Pill,
  Activity,
  ShieldCheck,
  Package,
  Settings,
  X,
  AlertTriangle,
  ChevronDown,
  Filter,
} from "lucide-react";
import { Toaster } from "react-hot-toast";

// ===== TYPES & INTERFACES =====
interface Medicine {
  _id?: string;
  id?: string;
  medicineName: string;
  genericName?: string;
  brandName?: string;
  category: MedicineCategory;
  dentalUse: DentalUseCategory;
  dosageForm: DosageForm;
  strength: string;
  unit: string;
  dosageInstructions: string;
  isActive: boolean;
  status?: string;
  manufacturer?: string;
  description?: string;
  sideEffects?: string[];
  contraindications?: string[];
  activeIngredients?: string[];
  prescriptionRequired?: boolean;
  fullMedicineName?: string;
  searchableText?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
}

enum MedicineCategory {
  ANTIBIOTIC = "Antibiotic",
  PAIN_RELIEF = "Pain Relief",
  ANTI_INFLAMMATORY = "Anti-inflammatory",
  ANTISEPTIC = "Antiseptic",
  ANESTHETIC = "Anesthetic",
  MOUTH_RINSE = "Mouth Rinse",
  FLUORIDE = "Fluoride Treatment",
  VITAMIN = "Vitamin/Supplement",
}

enum DentalUseCategory {
  ROOT_CANAL = "Root Canal",
  EXTRACTION = "Tooth Extraction",
  CLEANING = "Dental Cleaning",
  FILLING = "Dental Filling",
  GUM_TREATMENT = "Gum Treatment",
  ORAL_SURGERY = "Oral Surgery",
  PREVENTIVE = "Preventive Care",
  GENERAL = "General Treatment",
}

enum DosageForm {
  TABLET = "Tablet",
  CAPSULE = "Capsule",
  LIQUID = "Liquid/Syrup",
  GEL = "Gel",
  OINTMENT = "Ointment",
  MOUTH_WASH = "Mouthwash",
  DROPS = "Drops",
}

interface MedicinePayload {
  medicineName: string;
  genericName?: string;
  brandName?: string;
  category: MedicineCategory;
  dentalUse: DentalUseCategory;
  dosageForm: DosageForm;
  strength: string;
  unit: string;
  dosageInstructions: string;
  manufacturer?: string;
  description?: string;
  prescriptionRequired?: boolean;
  isActive?: boolean;
}

interface FormData extends MedicinePayload {
  isActive: boolean;
}

interface FormErrors {
  medicineName?: string;
  category?: string;
  dentalUse?: string;
  dosageForm?: string;
  strength?: string;
  unit?: string;
  dosageInstructions?: string;
}

interface Stats {
  total: number;
  active: number;
  prescriptionRequired: number;
  categories: number;
}

interface ApiResponse {
  data: {
    medicines: Medicine[];
  };
}

interface Theme {
  colors: {
    primary: string;
    primaryDark: string;
    success: string;
    danger: string;
    warning: string;
    gray50: string;
    gray100: string;
    gray200: string;
    gray300: string;
    gray400: string;
    gray500: string;
    gray600: string;
    gray700: string;
    gray800: string;
    gray900: string;
    white: string;
  };
}

const theme: Theme = {
  colors: {
    primary: "#6366f1",
    primaryDark: "#4f46e5",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    gray50: "#f9fafb",
    gray100: "#f3f4f6",
    gray200: "#e5e7eb",
    gray300: "#d1d5db",
    gray400: "#9ca3af",
    gray500: "#6b7280",
    gray600: "#4b5563",
    gray700: "#374151",
    gray800: "#1f2937",
    gray900: "#111827",
    white: "#ffffff",
  },
};

interface MedicineManagementProps {
  onSelectMedicine?: (medicine: Medicine) => void;
  isSelectionMode?: boolean;
}

const MedicineManagement: React.FC<MedicineManagementProps> = ({
  onSelectMedicine,
  isSelectionMode = false,
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDentalUse, setSelectedDentalUse] = useState<string>("all");
  const [selectedMedicines, setSelectedMedicines] = useState<Set<string>>(
    new Set()
  );
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // React Query hooks
  const { data, isLoading, isError, error, refetch } = useAllMedicines();
  const medicines: Medicine[] = data?.data?.medicines || [];

  // Mutation hooks with proper success callbacks
  const createMedicineMutation = useCreateMedicine();
  const updateMedicineMutation = useUpdateMedicine();
  const deleteMedicineMutation = useDeleteMedicine();

  const [formData, setFormData] = useState<FormData>({
    medicineName: "",
    genericName: "",
    brandName: "",
    category: MedicineCategory.PAIN_RELIEF,
    dentalUse: DentalUseCategory.GENERAL,
    dosageForm: DosageForm.TABLET,
    strength: "",
    unit: "mg",
    dosageInstructions: "",
    manufacturer: "",
    description: "",
    prescriptionRequired: false,
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form helper
  const resetForm = () => {
    setFormData({
      medicineName: "",
      genericName: "",
      brandName: "",
      category: MedicineCategory.PAIN_RELIEF,
      dentalUse: DentalUseCategory.GENERAL,
      dosageForm: DosageForm.TABLET,
      strength: "",
      unit: "mg",
      dosageInstructions: "",
      manufacturer: "",
      description: "",
      prescriptionRequired: false,
      isActive: true,
    });
    setErrors({});
    setSelectedMedicine(null);
    setIsEditMode(false);
  };

  // Calculate stats from actual data
  const stats: Stats = useMemo(() => {
    if (!medicines.length) {
      return {
        total: 0,
        active: 0,
        prescriptionRequired: 0,
        categories: 0,
      };
    }

    return {
      total: medicines.length,
      active: medicines.filter(
        (med) => med.isActive && (med.status === "active" || !med.status)
      ).length,
      prescriptionRequired: medicines.filter(
        (med) => med.prescriptionRequired && med.isActive
      ).length,
      categories: new Set(
        medicines.filter((med) => med.isActive).map((med) => med.category)
      ).size,
    };
  }, [medicines]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.medicineName.trim()) {
      newErrors.medicineName = "Medicine name is required";
    }
    if (!formData.strength.trim()) {
      newErrors.strength = "Strength is required";
    }
    if (!formData.dosageInstructions.trim()) {
      newErrors.dosageInstructions = "Dosage instructions are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Prepare payload according to MedicinePayload interface
      const medicinePayload: MedicinePayload = {
        medicineName: formData.medicineName.trim(),
        genericName: formData.genericName?.trim() || undefined,
        brandName: formData.brandName?.trim() || undefined,
        category: formData.category,
        dentalUse: formData.dentalUse,
        dosageForm: formData.dosageForm,
        strength: formData.strength.trim(),
        unit: formData.unit,
        dosageInstructions: formData.dosageInstructions.trim(),
        manufacturer: formData.manufacturer?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        prescriptionRequired: formData.prescriptionRequired,
        isActive: formData.isActive,
      };

      if (isEditMode && selectedMedicine) {
        // Update existing medicine
        await updateMedicineMutation.mutateAsync({
          id: selectedMedicine._id || selectedMedicine.id || "",
          medicineData: medicinePayload,
        });
      } else {
        // Create new medicine
        await createMedicineMutation.mutateAsync(medicinePayload);
      }

      // Close modal and reset form on success
      setShowCreateModal(false);
      resetForm();
      refetch(); // Refresh the list
    } catch (error) {
      console.error("Error saving medicine:", error);
      // Error handling is done by the mutation hooks with toast notifications
    }
  };

  const handleSelectMedicine = (medicineId: string) => {
    const newSelected = new Set(selectedMedicines);
    if (newSelected.has(medicineId)) {
      newSelected.delete(medicineId);
    } else {
      newSelected.add(medicineId);
    }
    setSelectedMedicines(newSelected);
  };

  const handleViewMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowDetailsModal(true);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsEditMode(true);
    setFormData({
      medicineName: medicine.medicineName,
      genericName: medicine.genericName || "",
      brandName: medicine.brandName || "",
      category: medicine.category,
      dentalUse: medicine.dentalUse,
      dosageForm: medicine.dosageForm,
      strength: medicine.strength,
      unit: medicine.unit,
      dosageInstructions: medicine.dosageInstructions,
      manufacturer: medicine.manufacturer || "",
      description: medicine.description || "",
      prescriptionRequired: medicine.prescriptionRequired || false,
      isActive: medicine.isActive,
    });
    setShowCreateModal(true);
  };

  const handleAddMedicine = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleDeleteMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowDeleteModal(true);
  };

  const confirmDeleteMedicine = async () => {
    if (!selectedMedicine) return;

    try {
      const medicineId = selectedMedicine._id || selectedMedicine.id || "";
      await deleteMedicineMutation.mutateAsync(medicineId);

      setShowDeleteModal(false);
      setSelectedMedicine(null);
      refetch(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete medicine:", error);
      // Error handling is done by the mutation hook with toast notifications
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const matchesSearch =
        medicine.medicineName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        medicine.genericName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        medicine.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || medicine.category === selectedCategory;
      const matchesDentalUse =
        selectedDentalUse === "all" || medicine.dentalUse === selectedDentalUse;
      const isActive =
        medicine.isActive && (medicine.status === "active" || !medicine.status);
      return matchesSearch && matchesCategory && matchesDentalUse && isActive;
    });
  }, [medicines, searchTerm, selectedCategory, selectedDentalUse]);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Antibiotic: "#ef4444",
      "Pain Relief": "#f59e0b",
      "Anti-inflammatory": "#8b5cf6",
      Antiseptic: "#10b981",
      Anesthetic: "#ec4899",
      "Mouth Rinse": "#06b6d4",
      "Fluoride Treatment": "#059669",
      "Vitamin/Supplement": "#6366f1",
    };
    return colors[category] || theme.colors.gray500;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if any mutation is in progress
  const isSubmitting =
    createMedicineMutation.isPending || updateMedicineMutation.isPending;
  const isDeleting = deleteMedicineMutation.isPending;

  // Loading state
  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading medicines...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  // Error state
  if (isError) {
    return (
      <Container>
        <ErrorContainer>
          <AlertTriangle size={48} color={theme.colors.danger} />
          <ErrorTitle>Failed to load medicines</ErrorTitle>
          <ErrorMessage>
            {(error as Error)?.message ||
              "An unexpected error occurred while loading medicines."}
          </ErrorMessage>
          <RetryButton onClick={() => refetch()}>Try Again</RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Toaster position="top-right" toastOptions={{ duration: 2000 }} />

      {/* Header */}
      <Header>
        <HeaderContent>
          <Title>
            {isSelectionMode
              ? "Select Medicine for Prescription"
              : "Medicine Management"}
          </Title>
          <Subtitle>
            {isSelectionMode
              ? "Choose from our comprehensive dental medicine database"
              : "Manage your dental pharmacy inventory and prescriptions"}
          </Subtitle>
        </HeaderContent>
        <HeaderActions>
          {!isSelectionMode && (
            <CreateButton onClick={handleAddMedicine} disabled={isSubmitting}>
              <Plus size={16} />
              Add Medicine
            </CreateButton>
          )}
        </HeaderActions>
      </Header>

      {/* Stats Cards */}
      <StatsGrid>
        <StatCard>
          <StatIcon style={{ background: "#eff6ff", color: "#2563eb" }}>
            <Package size={20} />
          </StatIcon>
          <StatContent>
            <StatNumber>{stats.total}</StatNumber>
            <StatLabel>Total Medicines</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon style={{ background: "#f0fdf4", color: "#16a34a" }}>
            <Activity size={20} />
          </StatIcon>
          <StatContent>
            <StatNumber>{stats.active}</StatNumber>
            <StatLabel>Active Medicines</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon style={{ background: "#fef3c7", color: "#d97706" }}>
            <ShieldCheck size={20} />
          </StatIcon>
          <StatContent>
            <StatNumber>{stats.prescriptionRequired}</StatNumber>
            <StatLabel>Prescription Required</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon style={{ background: "#fce7f3", color: "#be185d" }}>
            <Pill size={20} />
          </StatIcon>
          <StatContent>
            <StatNumber>{stats.categories}</StatNumber>
            <StatLabel>Categories</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Main Content */}
      <ContentContainer>
        {/* Filters and Search */}
        <FiltersSection>
          <SearchContainer>
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search medicines by name, brand, or manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          <FiltersRight>
            <CategoryFilter>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {Object.values(MedicineCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </CategoryFilter>
            <DentalUseFilter>
              <select
                value={selectedDentalUse}
                onChange={(e) => setSelectedDentalUse(e.target.value)}
              >
                <option value="all">All Uses</option>
                {Object.values(DentalUseCategory).map((use) => (
                  <option key={use} value={use}>
                    {use}
                  </option>
                ))}
              </select>
            </DentalUseFilter>
            <FilterButton>
              <Filter size={16} />
              More Filters
            </FilterButton>
            {selectedMedicines.size > 0 && (
              <BulkActions>
                <span>{selectedMedicines.size} selected</span>
                <BulkButton onClick={() => console.log("Bulk activate")}>
                  Activate
                </BulkButton>
                <BulkButton
                  variant="danger"
                  onClick={() => console.log("Bulk deactivate")}
                >
                  Deactivate
                </BulkButton>
              </BulkActions>
            )}
          </FiltersRight>
        </FiltersSection>

        {/* Medicines Table/Grid */}
        <TableContainer>
          {filteredMedicines.length === 0 ? (
            <EmptyState>
              <Pill size={64} color={theme.colors.gray400} />
              <EmptyTitle>No medicines found</EmptyTitle>
              <EmptyMessage>
                {searchTerm ||
                selectedCategory !== "all" ||
                selectedDentalUse !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by adding your first medicine to the inventory."}
              </EmptyMessage>
              {!searchTerm &&
                selectedCategory === "all" &&
                selectedDentalUse === "all" &&
                !isSelectionMode && (
                  <CreateButton
                    onClick={handleAddMedicine}
                    disabled={isSubmitting}
                  >
                    <Plus size={16} />
                    Add First Medicine
                  </CreateButton>
                )}
            </EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <th>
                    <Checkbox
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMedicines(
                            new Set(
                              filteredMedicines.map((m) => m._id || m.id || "")
                            )
                          );
                        } else {
                          setSelectedMedicines(new Set());
                        }
                      }}
                    />
                  </th>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Dental Use</th>
                  <th>Strength</th>
                  <th>Form</th>
                  <th>Prescription</th>
                  <th>Actions</th>
                </tr>
              </TableHeader>
              <tbody>
                {filteredMedicines.map((medicine) => {
                  const medicineId = medicine._id || medicine.id || "";
                  return (
                    <TableRow key={medicineId}>
                      <td>
                        <Checkbox
                          type="checkbox"
                          checked={selectedMedicines.has(medicineId)}
                          onChange={() => handleSelectMedicine(medicineId)}
                        />
                      </td>
                      <td>
                        <MedicineInfo>
                          <MedicineIcon>
                            <Pill size={16} />
                          </MedicineIcon>
                          <MedicineDetails>
                            <MedicineName>{medicine.medicineName}</MedicineName>
                            {medicine.genericName && (
                              <MedicineGeneric>
                                Generic: {medicine.genericName}
                              </MedicineGeneric>
                            )}
                            {medicine.brandName && (
                              <MedicineBrand>
                                Brand: {medicine.brandName}
                              </MedicineBrand>
                            )}
                            {medicine.manufacturer && (
                              <MedicineManufacturer>
                                by {medicine.manufacturer}
                              </MedicineManufacturer>
                            )}
                          </MedicineDetails>
                        </MedicineInfo>
                      </td>
                      <td>
                        <CategoryBadge
                          color={getCategoryColor(medicine.category)}
                        >
                          {medicine.category}
                        </CategoryBadge>
                      </td>
                      <td>
                        <DentalUseBadge>{medicine.dentalUse}</DentalUseBadge>
                      </td>
                      <td>
                        <StrengthInfo>
                          <strong>
                            {medicine.strength} {medicine.unit}
                          </strong>
                        </StrengthInfo>
                      </td>
                      <td>
                        <FormInfo>{medicine.dosageForm}</FormInfo>
                      </td>
                      <td>
                        <PrescriptionBadge
                          required={medicine.prescriptionRequired || false}
                        >
                          {medicine.prescriptionRequired
                            ? "Required"
                            : "Not Required"}
                        </PrescriptionBadge>
                      </td>
                      <td>
                        <ActionsContainer>
                          <ActionButton
                            title="View Details"
                            onClick={() => handleViewMedicine(medicine)}
                          >
                            <Eye size={16} />
                          </ActionButton>
                          {isSelectionMode ? (
                            <ActionButton
                              title="Select Medicine"
                              onClick={() => onSelectMedicine?.(medicine)}
                              variant="success"
                            >
                              <Plus size={16} />
                            </ActionButton>
                          ) : (
                            <>
                              <ActionButton
                                title="Edit Medicine"
                                onClick={() => handleEditMedicine(medicine)}
                                variant="primary"
                                disabled={isSubmitting || isDeleting}
                              >
                                <Edit size={16} />
                              </ActionButton>
                              <ActionButton
                                title="Delete Medicine"
                                onClick={() => handleDeleteMedicine(medicine)}
                                variant="danger"
                                disabled={isSubmitting || isDeleting}
                              >
                                <Trash2 size={16} />
                              </ActionButton>
                            </>
                          )}
                        </ActionsContainer>
                      </td>
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          )}
        </TableContainer>

        {/* Pagination */}
        {filteredMedicines.length > 0 && (
          <Pagination>
            <PaginationInfo>
              Showing 1-{filteredMedicines.length} of {medicines.length}{" "}
              medicines
            </PaginationInfo>
            <PaginationControls>
              <PaginationButton disabled>← Previous</PaginationButton>
              <PaginationNumber active>1</PaginationNumber>
              <PaginationNumber>2</PaginationNumber>
              <PaginationNumber>3</PaginationNumber>
              <PaginationButton>Next →</PaginationButton>
            </PaginationControls>
          </Pagination>
        )}
      </ContentContainer>

      {/* Create/Edit Medicine Modal */}
      {showCreateModal && (
        <ModalOverlay onClick={() => setShowCreateModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>
                  {isEditMode ? "Edit Medicine" : "Add New Medicine"}
                </ModalTitle>
                <ModalSubtitle>
                  {isEditMode
                    ? "Update medicine information"
                    : "Add a new medicine to your inventory"}
                </ModalSubtitle>
              </div>
              <CloseButton onClick={handleCloseModal} disabled={isSubmitting}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <ModalContent>
              <Form onSubmit={handleSubmit}>
                <FormGrid>
                  <FormGroup className="full-width">
                    <Label>Medicine Name *</Label>
                    <Input
                      type="text"
                      name="medicineName"
                      value={formData.medicineName}
                      onChange={handleInputChange}
                      hasError={!!errors.medicineName}
                      placeholder="Enter medicine name"
                      disabled={isSubmitting}
                    />
                    {errors.medicineName && (
                      <ErrorText>{errors.medicineName}</ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Generic Name</Label>
                    <Input
                      type="text"
                      name="genericName"
                      value={formData.genericName}
                      onChange={handleInputChange}
                      placeholder="Enter generic name"
                      disabled={isSubmitting}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Brand Name</Label>
                    <Input
                      type="text"
                      name="brandName"
                      value={formData.brandName}
                      onChange={handleInputChange}
                      placeholder="Enter brand name"
                      disabled={isSubmitting}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Category *</Label>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      {Object.values(MedicineCategory).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Dental Use *</Label>
                    <Select
                      name="dentalUse"
                      value={formData.dentalUse}
                      onChange={handleInputChange}
                    >
                      {Object.values(DentalUseCategory).map((use) => (
                        <option key={use} value={use}>
                          {use}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Dosage Form *</Label>
                    <Select
                      name="dosageForm"
                      value={formData.dosageForm}
                      onChange={handleInputChange}
                    >
                      {Object.values(DosageForm).map((form) => (
                        <option key={form} value={form}>
                          {form}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Strength *</Label>
                    <Input
                      type="text"
                      name="strength"
                      value={formData.strength}
                      onChange={handleInputChange}
                      hasError={!!errors.strength}
                      placeholder="e.g., 500"
                    />
                    {errors.strength && (
                      <ErrorText>{errors.strength}</ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Unit</Label>
                    <Select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                    >
                      <option value="mg">mg</option>
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="mcg">mcg</option>
                      <option value="IU">IU</option>
                      <option value="%">%</option>
                    </Select>
                  </FormGroup>

                  <FormGroup className="full-width">
                    <Label>Manufacturer</Label>
                    <Input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      placeholder="Enter manufacturer name"
                    />
                  </FormGroup>

                  <FormGroup className="full-width">
                    <Label>Description</Label>
                    <TextArea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter medicine description..."
                    />
                  </FormGroup>

                  <FormGroup className="full-width">
                    <Label>Dosage Instructions *</Label>
                    <TextArea
                      name="dosageInstructions"
                      value={formData.dosageInstructions}
                      onChange={handleInputChange}
                      hasError={!!errors.dosageInstructions}
                      placeholder="e.g., Take 1 tablet twice daily after meals for 5 days"
                    />
                    {errors.dosageInstructions && (
                      <ErrorText>{errors.dosageInstructions}</ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup className="full-width">
                    <CheckboxContainer>
                      <Checkbox
                        type="checkbox"
                        name="prescriptionRequired"
                        checked={formData.prescriptionRequired || false}
                        onChange={handleInputChange}
                      />
                      <CheckboxLabel>
                        Prescription Required
                        <CheckboxHelper>
                          Check if this medicine requires a prescription
                        </CheckboxHelper>
                      </CheckboxLabel>
                    </CheckboxContainer>
                  </FormGroup>
                </FormGrid>

                <ModalActions>
                  <SecondaryButton
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton type="submit">
                    {selectedMedicine ? "Update Medicine" : "Add Medicine"}
                  </PrimaryButton>
                </ModalActions>
              </Form>
            </ModalContent>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* Medicine Details Modal */}
      {showDetailsModal && selectedMedicine && (
        <ModalOverlay onClick={() => setShowDetailsModal(false)}>
          <MedicineDetailsModalContainer onClick={(e) => e.stopPropagation()}>
            <MedicineDetailsHeader>
              <MedicineDetailsHeaderLeft>
                <MedicineDetailsIcon>
                  <Pill size={32} />
                </MedicineDetailsIcon>
                <MedicineDetailsInfo>
                  <MedicineDetailsName>
                    {selectedMedicine.medicineName}
                  </MedicineDetailsName>
                  <MedicineDetailsCategory
                    color={getCategoryColor(selectedMedicine.category)}
                  >
                    {selectedMedicine.category}
                  </MedicineDetailsCategory>
                  <MedicineDetailsStrength>
                    {selectedMedicine.strength} {selectedMedicine.unit} •{" "}
                    {selectedMedicine.dosageForm}
                  </MedicineDetailsStrength>
                </MedicineDetailsInfo>
              </MedicineDetailsHeaderLeft>
              <MedicineDetailsActions>
                <CloseButton onClick={() => setShowDetailsModal(false)}>
                  <X size={20} />
                </CloseButton>
              </MedicineDetailsActions>
            </MedicineDetailsHeader>

            <MedicineDetailsContent>
              <MedicineDetailsSection>
                <SectionTitle>Basic Information</SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Medicine Name</InfoLabel>
                    <InfoValue>{selectedMedicine.medicineName}</InfoValue>
                  </InfoItem>
                  {selectedMedicine.genericName && (
                    <InfoItem>
                      <InfoLabel>Generic Name</InfoLabel>
                      <InfoValue>{selectedMedicine.genericName}</InfoValue>
                    </InfoItem>
                  )}
                  {selectedMedicine.brandName && (
                    <InfoItem>
                      <InfoLabel>Brand Name</InfoLabel>
                      <InfoValue>{selectedMedicine.brandName}</InfoValue>
                    </InfoItem>
                  )}
                  {selectedMedicine.manufacturer && (
                    <InfoItem>
                      <InfoLabel>Manufacturer</InfoLabel>
                      <InfoValue>{selectedMedicine.manufacturer}</InfoValue>
                    </InfoItem>
                  )}
                  <InfoItem>
                    <InfoLabel>Strength</InfoLabel>
                    <InfoValue>
                      {selectedMedicine.strength} {selectedMedicine.unit}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Dosage Form</InfoLabel>
                    <InfoValue>{selectedMedicine.dosageForm}</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </MedicineDetailsSection>

              <MedicineDetailsSection>
                <SectionTitle>Clinical Information</SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Category</InfoLabel>
                    <InfoValue>
                      <CategoryBadge
                        color={getCategoryColor(selectedMedicine.category)}
                      >
                        {selectedMedicine.category}
                      </CategoryBadge>
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Dental Use</InfoLabel>
                    <InfoValue>{selectedMedicine.dentalUse}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Prescription Required</InfoLabel>
                    <InfoValue>
                      <PrescriptionBadge
                        required={
                          selectedMedicine.prescriptionRequired || false
                        }
                      >
                        {selectedMedicine.prescriptionRequired
                          ? "Required"
                          : "Not Required"}
                      </PrescriptionBadge>
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Status</InfoLabel>
                    <InfoValue>
                      <StatusBadge
                        color={
                          selectedMedicine.isActive
                            ? theme.colors.success
                            : theme.colors.danger
                        }
                      >
                        <StatusDot
                          color={
                            selectedMedicine.isActive
                              ? theme.colors.success
                              : theme.colors.danger
                          }
                        />
                        {selectedMedicine.status ||
                          (selectedMedicine.isActive ? "Active" : "Inactive")}
                      </StatusBadge>
                    </InfoValue>
                  </InfoItem>
                </InfoGrid>
              </MedicineDetailsSection>

              <MedicineDetailsSection>
                <SectionTitle>Usage Instructions</SectionTitle>
                <InfoGrid>
                  <InfoItem className="full-width">
                    <InfoLabel>Dosage Instructions</InfoLabel>
                    <InfoValue>{selectedMedicine.dosageInstructions}</InfoValue>
                  </InfoItem>
                  {selectedMedicine.description && (
                    <InfoItem className="full-width">
                      <InfoLabel>Description</InfoLabel>
                      <InfoValue>{selectedMedicine.description}</InfoValue>
                    </InfoItem>
                  )}
                </InfoGrid>
              </MedicineDetailsSection>

              {(selectedMedicine.sideEffects?.length ||
                selectedMedicine.contraindications?.length ||
                selectedMedicine.activeIngredients?.length) && (
                <MedicineDetailsSection>
                  <SectionTitle>Additional Information</SectionTitle>
                  <InfoGrid>
                    {selectedMedicine.activeIngredients?.length && (
                      <InfoItem>
                        <InfoLabel>Active Ingredients</InfoLabel>
                        <InfoValue>
                          <ul style={{ margin: 0, paddingLeft: "20px" }}>
                            {selectedMedicine.activeIngredients.map(
                              (ingredient, index) => (
                                <li key={index}>{ingredient}</li>
                              )
                            )}
                          </ul>
                        </InfoValue>
                      </InfoItem>
                    )}
                    {selectedMedicine.sideEffects?.length && (
                      <InfoItem>
                        <InfoLabel>Side Effects</InfoLabel>
                        <InfoValue>
                          <ul style={{ margin: 0, paddingLeft: "20px" }}>
                            {selectedMedicine.sideEffects.map(
                              (effect, index) => (
                                <li key={index}>{effect}</li>
                              )
                            )}
                          </ul>
                        </InfoValue>
                      </InfoItem>
                    )}
                    {selectedMedicine.contraindications?.length && (
                      <InfoItem className="full-width">
                        <InfoLabel>Contraindications</InfoLabel>
                        <InfoValue>
                          <ul style={{ margin: 0, paddingLeft: "20px" }}>
                            {selectedMedicine.contraindications.map(
                              (contraindication, index) => (
                                <li key={index}>{contraindication}</li>
                              )
                            )}
                          </ul>
                        </InfoValue>
                      </InfoItem>
                    )}
                  </InfoGrid>
                </MedicineDetailsSection>
              )}

              {(selectedMedicine.createdAt || selectedMedicine.updatedAt) && (
                <MedicineDetailsSection>
                  <SectionTitle>System Information</SectionTitle>
                  <InfoGrid>
                    {selectedMedicine.createdAt && (
                      <InfoItem>
                        <InfoLabel>Created Date</InfoLabel>
                        <InfoValue>
                          {formatDate(selectedMedicine.createdAt)}
                        </InfoValue>
                      </InfoItem>
                    )}
                    {selectedMedicine.updatedAt && (
                      <InfoItem>
                        <InfoLabel>Last Updated</InfoLabel>
                        <InfoValue>
                          {formatDate(selectedMedicine.updatedAt)}
                        </InfoValue>
                      </InfoItem>
                    )}
                    {selectedMedicine._id && (
                      <InfoItem>
                        <InfoLabel>Medicine ID</InfoLabel>
                        <InfoValue>#{selectedMedicine._id}</InfoValue>
                      </InfoItem>
                    )}
                  </InfoGrid>
                </MedicineDetailsSection>
              )}
            </MedicineDetailsContent>
          </MedicineDetailsModalContainer>
        </ModalOverlay>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMedicine && (
        <ModalOverlay onClick={() => setShowDeleteModal(false)}>
          <ConfirmationModalContainer onClick={(e) => e.stopPropagation()}>
            <ConfirmationHeader>
              <ConfirmationIcon variant="danger">
                <AlertTriangle size={32} />
              </ConfirmationIcon>
              <ConfirmationTitle>Delete Medicine</ConfirmationTitle>
              <ConfirmationMessage>
                Are you sure you want to delete{" "}
                <strong>{selectedMedicine.medicineName}</strong>? This action
                cannot be undone and will permanently remove this medicine from
                your inventory.
              </ConfirmationMessage>
            </ConfirmationHeader>

            <ConfirmationActions>
              <SecondaryButton onClick={() => setShowDeleteModal(false)}>
                Cancel
              </SecondaryButton>
              <DangerButton onClick={confirmDeleteMedicine}>
                Delete Medicine
              </DangerButton>
            </ConfirmationActions>
          </ConfirmationModalContainer>
        </ModalOverlay>
      )}
    </Container>
  );
};

// Styled Components (following the user management design pattern)
const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.gray50};
  padding: 20px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${theme.colors.gray200};
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
  color: ${theme.colors.gray600};
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${theme.colors.gray900};
  margin: 0;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: ${theme.colors.gray600};
  margin: 0;
  max-width: 400px;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.gray900};
  margin: 16px 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 16px;
  color: ${theme.colors.gray600};
  margin: 0 0 24px 0;
  max-width: 400px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${theme.colors.gray900};
  margin: 0 0 4px 0;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${theme.colors.gray600};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${theme.colors.gray200};
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div``;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.gray900};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${theme.colors.gray600};
  font-weight: 500;
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${theme.colors.gray200};
  overflow: hidden;
`;

const FiltersSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${theme.colors.gray200};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.gray400};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid ${theme.colors.gray300};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &::placeholder {
    color: ${theme.colors.gray400};
  }
`;

const FiltersRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const CategoryFilter = styled.div`
  select {
    padding: 8px 12px;
    border: 1px solid ${theme.colors.gray300};
    border-radius: 6px;
    font-size: 14px;
    background: white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
    }
  }
`;

const DentalUseFilter = styled.div`
  select {
    padding: 8px 12px;
    border: 1px solid ${theme.colors.gray300};
    border-radius: 6px;
    font-size: 14px;
    background: white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
    }
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid ${theme.colors.gray300};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.gray50};
  }
`;

const BulkActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${theme.colors.gray50};
  border-radius: 6px;
  font-size: 14px;
  color: ${theme.colors.gray600};
`;

const BulkButton = styled.button<{ variant?: string }>`
  padding: 4px 8px;
  background: ${(props) =>
    props.variant === "danger" ? theme.colors.danger : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: ${theme.colors.gray50};

  th {
    padding: 16px 24px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: ${theme.colors.gray600};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid ${theme.colors.gray200};
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.gray200};
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.gray50};
  }

  td {
    padding: 16px 24px;
    vertical-align: middle;
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${theme.colors.primary};
  cursor: pointer;
`;

const MedicineInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MedicineIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MedicineDetails = styled.div``;

const MedicineName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.gray900};
  margin-bottom: 2px;
`;

const MedicineGeneric = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray600};
  margin-bottom: 1px;
`;

const MedicineBrand = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray600};
  margin-bottom: 1px;
`;

const MedicineManufacturer = styled.div`
  font-size: 11px;
  color: ${theme.colors.gray500};
  font-style: italic;
`;

const CategoryBadge = styled.span<{ color: string }>`
  padding: 4px 8px;
  background: ${(props) => props.color}15;
  color: ${(props) => props.color};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const DentalUseBadge = styled.span`
  padding: 4px 8px;
  background: ${theme.colors.gray100};
  color: ${theme.colors.gray700};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const StrengthInfo = styled.div`
  font-size: 13px;
  color: ${theme.colors.gray700};
`;

const FormInfo = styled.div`
  font-size: 13px;
  color: ${theme.colors.gray600};
`;

const PrescriptionBadge = styled.span<{ required: boolean }>`
  padding: 4px 8px;
  background: ${(props) => (props.required ? "#fef3c7" : "#f0fdf4")};
  color: ${(props) => (props.required ? "#d97706" : "#16a34a")};
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
`;

const StatusBadge = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => props.color};
`;

const StatusDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => props.color};
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button<{ variant?: string }>`
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${(props) => {
      switch (props.variant) {
        case "danger":
          return "#fef2f2";
        case "primary":
          return "#eff6ff";
        case "success":
          return "#f0fdf4";
        default:
          return theme.colors.gray100;
      }
    }};
    color: ${(props) => {
      switch (props.variant) {
        case "danger":
          return theme.colors.danger;
        case "primary":
          return theme.colors.primary;
        case "success":
          return theme.colors.success;
        default:
          return "inherit";
      }
    }};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid ${theme.colors.gray200};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: ${theme.colors.gray600};
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${theme.colors.gray300};
  background: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${theme.colors.gray50};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationNumber = styled.button<{ active?: boolean }>`
  width: 36px;
  height: 36px;
  border: 1px solid
    ${(props) => (props.active ? theme.colors.primary : theme.colors.gray300)};
  background: ${(props) => (props.active ? theme.colors.primary : "white")};
  color: ${(props) => (props.active ? "white" : theme.colors.gray700)};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.active ? theme.colors.primaryDark : theme.colors.gray50};
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  animation: modalEnter 0.3s ease-out;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  @keyframes modalEnter {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid ${theme.colors.gray200};
  background: linear-gradient(
    135deg,
    ${theme.colors.primary}08,
    ${theme.colors.primary}03
  );
`;

const ModalTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${theme.colors.gray900};
  margin: 0 0 4px 0;
`;

const ModalSubtitle = styled.p`
  font-size: 14px;
  color: ${theme.colors.gray600};
  margin: 0;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.gray500};

  &:hover {
    background: ${theme.colors.gray100};
    color: ${theme.colors.gray700};
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
`;

const Form = styled.form``;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  .full-width {
    grid-column: 1 / -1;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.gray700};
  margin-bottom: 6px;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 12px 16px;
  border: 1px solid
    ${(props) => (props.hasError ? theme.colors.danger : theme.colors.gray300)};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: ${(props) => (props.hasError ? "#fef2f2" : "white")};

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${(props) => (props.hasError ? "#fca5a520" : `${theme.colors.primary}20`)};
  }

  &::placeholder {
    color: ${theme.colors.gray400};
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  padding: 12px 16px;
  border: 1px solid
    ${(props) => (props.hasError ? theme.colors.danger : theme.colors.gray300)};
  border-radius: 8px;
  font-size: 14px;
  background: ${(props) => (props.hasError ? "#fef2f2" : "white")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${(props) => (props.hasError ? "#fca5a520" : `${theme.colors.primary}20`)};
  }
`;

const TextArea = styled.textarea<{ hasError?: boolean }>`
  padding: 12px 16px;
  border: 1px solid
    ${(props) => (props.hasError ? theme.colors.danger : theme.colors.gray300)};
  border-radius: 8px;
  font-size: 14px;
  background: ${(props) => (props.hasError ? "#fef2f2" : "white")};
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${(props) => (props.hasError ? "#fca5a520" : `${theme.colors.primary}20`)};
  }

  &::placeholder {
    color: ${theme.colors.gray400};
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: ${theme.colors.gray50};
  border-radius: 8px;
  border: 1px solid ${theme.colors.gray200};
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.gray700};
  cursor: pointer;
  line-height: 1.4;
`;

const CheckboxHelper = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray500};
  margin-top: 4px;
  font-weight: normal;
`;

const ErrorText = styled.span`
  color: ${theme.colors.danger};
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: "⚠";
    font-size: 10px;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid ${theme.colors.gray200};

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const SecondaryButton = styled.button`
  padding: 12px 20px;
  background: white;
  color: ${theme.colors.gray700};
  border: 1px solid ${theme.colors.gray300};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${theme.colors.gray50};
    border-color: ${theme.colors.gray400};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PrimaryButton = styled.button`
  padding: 12px 20px;
  background: ${theme.colors.primary};
  color: white;
  border: 1px solid ${theme.colors.primary};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryDark};
    border-color: ${theme.colors.primaryDark};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

// Medicine Details Modal Styles
const MedicineDetailsModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  animation: modalEnter 0.3s ease-out;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const MedicineDetailsHeader = styled.div`
  padding: 32px;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary}15,
    ${theme.colors.primary}05
  );
  border-bottom: 1px solid ${theme.colors.gray200};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const MedicineDetailsHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const MedicineDetailsIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary},
    ${theme.colors.primaryDark}
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px -8px ${theme.colors.primary}50;
`;

const MedicineDetailsInfo = styled.div``;

const MedicineDetailsName = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.gray900};
  margin: 0 0 8px 0;
`;

const MedicineDetailsCategory = styled.div<{ color: string }>`
  display: inline-block;
  padding: 6px 12px;
  background: ${(props) => props.color}15;
  color: ${(props) => props.color};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const MedicineDetailsStrength = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: ${theme.colors.gray600};
`;

const MedicineDetailsActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
`;

const MedicineDetailsContent = styled.div`
  padding: 32px;
  max-height: 60vh;
  overflow-y: auto;
`;

const MedicineDetailsSection = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.gray900};
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid ${theme.colors.gray100};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;

  .full-width {
    grid-column: 1 / -1;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.full-width {
    grid-column: 1 / -1;
  }
`;

const InfoLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.gray500};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.gray900};
  padding: 8px 0;
  line-height: 1.5;
`;

// Confirmation Modal Styles
const ConfirmationModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  position: relative;
  animation: modalEnter 0.3s ease-out;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const ConfirmationHeader = styled.div`
  padding: 32px;
  text-align: center;
`;

const ConfirmationIcon = styled.div<{ variant?: string }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;

  ${(props) => {
    switch (props.variant) {
      case "danger":
        return `
          background: #fef2f2;
          color: ${theme.colors.danger};
        `;
      default:
        return `
          background: ${theme.colors.gray100};
          color: ${theme.colors.gray600};
        `;
    }
  }}
`;

const ConfirmationTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.gray900};
  margin: 0 0 12px 0;
`;

const ConfirmationMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.gray600};
  line-height: 1.5;
  margin: 0;
`;

const ConfirmationActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 24px 32px 32px;
  justify-content: center;
`;

const DangerButton = styled.button`
  padding: 12px 20px;
  background: ${theme.colors.danger};
  color: white;
  border: 1px solid ${theme.colors.danger};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #dc2626;
    border-color: #dc2626;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export default MedicineManagement;
