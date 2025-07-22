import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { 
  FiStar,
  FiMessageSquare,
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiThumbsUp,
  FiFlag,
  FiShare2,
  FiRefreshCw,
  FiDownload,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiX,
  FiEdit3,
  FiCheck,
  FiClock,
  FiShield,
  FiChevronDown,
  FiChevronUp,
  FiMoreVertical
} from "react-icons/fi";

// Theme colors
const theme = {
  colors: {
    primary: "#7c3aed",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827"
    }
  }
};

const ReviewsManagement = () => {
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState({
    summary: true,
    reviews: true
  });
  const [selectedMetric, setSelectedMetric] = useState('compliments');
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  
  // Filters and date range
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 12)),
    to: new Date()
  });
  
  const [filters, setFilters] = useState({
    rating: 'all',
    hasResponse: 'all',
    verified: 'all'
  });
  
  const [sortBy, setSortBy] = useState('date_desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const mockRatingSummary = {
    averageRating: 4.6,
    totalReviews: 284,
    ratingDistribution: {
      5: 180,
      4: 68,
      3: 24,
      2: 8,
      1: 4
    },
    monthlyTrends: [
      { month: "2024-07", averageRating: 4.4, totalReviews: 32 },
      { month: "2024-08", averageRating: 4.5, totalReviews: 38 },
      { month: "2024-09", averageRating: 4.6, totalReviews: 41 },
      { month: "2024-10", averageRating: 4.7, totalReviews: 45 },
      { month: "2024-11", averageRating: 4.6, totalReviews: 42 },
      { month: "2024-12", averageRating: 4.6, totalReviews: 48 }
    ],
    topCompliments: [
      { text: "Professional and caring", count: 89 },
      { text: "Excellent communication", count: 76 },
      { text: "Thorough examination", count: 68 },
      { text: "Easy to understand", count: 54 },
      { text: "Comfortable environment", count: 42 }
    ],
    commonConcerns: [
      { text: "Long waiting time", count: 12 },
      { text: "Appointment scheduling", count: 8 },
      { text: "Follow-up communication", count: 5 }
    ],
    responseRate: 87,
    recommendationRate: 94
  };

  const mockReviews = [
    {
      id: "REV001",
      patient: {
        name: "Sarah Johnson",
        profilePicture: null,
        isReturning: true
      },
      rating: 5,
      comment: "Dr. Smith was absolutely wonderful! Very professional, took time to listen to my concerns, and explained everything clearly. The office staff was also very friendly and helpful. Highly recommend!",
      createdAt: "2025-07-20T10:30:00Z",
      appointmentType: "Consultation",
      appointmentDate: "2025-07-18T14:00:00Z",
      tags: ["Professional", "Caring", "Communication"],
      verified: true,
      helpfulVotes: 8,
      response: {
        text: "Thank you so much for your kind words, Sarah! I'm delighted that you had such a positive experience. It's always my goal to provide thorough care and clear communication. I look forward to seeing you for your follow-up visit.",
        createdAt: "2025-07-20T15:45:00Z"
      },
      featured: true,
      reported: false,
      viewed: true
    },
    {
      id: "REV002",
      patient: {
        name: "Mike Rodriguez",
        profilePicture: null,
        isReturning: false
      },
      rating: 4,
      comment: "Good doctor, very knowledgeable. The wait time was a bit long, but the consultation was thorough and I felt heard. Would visit again.",
      createdAt: "2025-07-19T16:20:00Z",
      appointmentType: "Check-up",
      appointmentDate: "2025-07-19T11:30:00Z",
      tags: ["Knowledgeable", "Thorough"],
      verified: true,
      helpfulVotes: 3,
      response: null,
      featured: false,
      reported: false,
      viewed: true
    },
    {
      id: "REV003",
      patient: {
        name: "Emily Chen",
        profilePicture: null,
        isReturning: true
      },
      rating: 5,
      comment: "Excellent care as always! Dr. Smith has been my doctor for 3 years now and I couldn't be happier. Always takes time to answer questions and follows up when needed.",
      createdAt: "2025-07-18T09:15:00Z",
      appointmentType: "Follow-up",
      appointmentDate: "2025-07-17T10:00:00Z",
      tags: ["Excellent Care", "Follow-up", "Questions"],
      verified: true,
      helpfulVotes: 12,
      response: {
        text: "Thank you, Emily! It's been wonderful caring for you over these years. I truly appreciate your trust and kind words.",
        createdAt: "2025-07-18T14:30:00Z"
      },
      featured: false,
      reported: false,
      viewed: true
    },
    {
      id: "REV004",
      patient: {
        name: "James Wilson",
        profilePicture: null,
        isReturning: false
      },
      rating: 3,
      comment: "The doctor was fine, but I had some confusion about the treatment plan. Could use better explanation of next steps.",
      createdAt: "2025-07-17T14:45:00Z",
      appointmentType: "Consultation",
      appointmentDate: "2025-07-16T16:00:00Z",
      tags: ["Treatment Plan"],
      verified: true,
      helpfulVotes: 1,
      response: null,
      featured: false,
      reported: false,
      viewed: false
    },
    {
      id: "REV005",
      patient: {
        name: "Lisa Anderson",
        profilePicture: null,
        isReturning: true
      },
      rating: 5,
      comment: "Outstanding service! The doctor was very attentive and took the time to explain my condition in detail. I appreciate the professional approach and would definitely recommend to others.",
      createdAt: "2025-07-16T11:20:00Z",
      appointmentType: "Consultation",
      appointmentDate: "2025-07-15T09:30:00Z",
      tags: ["Outstanding", "Attentive", "Professional"],
      verified: true,
      helpfulVotes: 6,
      response: {
        text: "Thank you for your wonderful feedback, Lisa! I'm so glad you felt well-informed about your condition. Providing clear explanations is very important to me.",
        createdAt: "2025-07-16T16:10:00Z"
      },
      featured: false,
      reported: false,
      viewed: true
    },
    {
      id: "REV006",
      patient: {
        name: "David Kim",
        profilePicture: null,
        isReturning: false
      },
      rating: 2,
      comment: "Felt rushed during the appointment. The doctor seemed distracted and didn't address all my concerns. The wait time was also longer than expected.",
      createdAt: "2025-07-15T13:45:00Z",
      appointmentType: "Check-up",
      appointmentDate: "2025-07-15T10:00:00Z",
      tags: ["Rushed", "Wait Time"],
      verified: true,
      helpfulVotes: 2,
      response: null,
      featured: false,
      reported: false,
      viewed: false
    }
  ];

  useEffect(() => {
    loadRatingSummary();
    loadReviews();
  }, [dateRange, filters, sortBy]);

  const loadRatingSummary = async () => {
    setLoading(prev => ({ ...prev, summary: true }));
    
    setTimeout(() => {
      setRatingSummary(mockRatingSummary);
      setLoading(prev => ({ ...prev, summary: false }));
    }, 800);
  };

  const loadReviews = async () => {
    setLoading(prev => ({ ...prev, reviews: true }));
    
    setTimeout(() => {
      const filteredReviews = mockReviews.filter(review => {
        const matchesRating = filters.rating === 'all' || review.rating.toString() === filters.rating;
        const matchesResponse = filters.hasResponse === 'all' || 
          (filters.hasResponse === 'yes' && review.response) ||
          (filters.hasResponse === 'no' && !review.response);
        const matchesSearch = !searchQuery || 
          review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.patient.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesRating && matchesResponse && matchesSearch;
      });
      
      setReviews(filteredReviews);
      setLoading(prev => ({ ...prev, reviews: false }));
    }, 600);
  };

  const processRatingSummary = (summary) => {
    if (!summary) return null;
    
    const total = Object.values(summary.ratingDistribution).reduce((sum, count) => sum + count, 0);
    const ratingPercentages = {};
    
    for (let i = 1; i <= 5; i++) {
      const count = summary.ratingDistribution[i] || 0;
      ratingPercentages[i] = total > 0 ? (count / total) * 100 : 0;
    }
    
    const currentMonth = summary.monthlyTrends[summary.monthlyTrends.length - 1];
    const previousMonth = summary.monthlyTrends[summary.monthlyTrends.length - 2];
    const ratingTrend = currentMonth && previousMonth 
      ? currentMonth.averageRating - previousMonth.averageRating 
      : 0;
    
    return {
      ...summary,
      ratingPercentages,
      ratingTrend,
      formattedAverage: summary.averageRating.toFixed(1)
    };
  };

  const processedSummary = processRatingSummary(ratingSummary);

  const handleReviewReply = async (reviewId, responseText) => {
    console.log('Replying to review:', reviewId, responseText);
    setReplyModalOpen(false);
    setSelectedReview(null);
    
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            response: { 
              text: responseText, 
              createdAt: new Date().toISOString() 
            } 
          }
        : review
    ));
  };

  const StarRating = ({ rating, size = 'medium', readonly = false }) => {
    const sizes = {
      small: 12,
      medium: 16,
      large: 20
    };
    
    return (
      <StarContainer>
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            filled={star <= rating} 
            size={sizes[size]}
          >
            <FiStar size={sizes[size]} />
          </Star>
        ))}
      </StarContainer>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatRelativeDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return formatDate(dateString);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return theme.colors.success;
    if (rating >= 3) return theme.colors.warning;
    return theme.colors.danger;
  };

  const RatingOverviewPanel = () => {
    if (loading.summary) {
      return (
        <OverviewPanel>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading rating overview...</LoadingText>
          </LoadingContainer>
        </OverviewPanel>
      );
    }

    if (!processedSummary) {
      return (
        <OverviewPanel>
          <ErrorState>
            <p>Failed to load rating summary</p>
            <ActionButton onClick={loadRatingSummary}>Retry</ActionButton>
          </ErrorState>
        </OverviewPanel>
      );
    }

    return (
      <OverviewPanel>
        <OverviewHeader>
          <h2>Rating Overview</h2>
          <DateRangeInfo>
            {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
          </DateRangeInfo>
        </OverviewHeader>

        <MetricsGrid>
          <MainRatingCard>
            <RatingScore>
              <ScoreNumber>{processedSummary.formattedAverage}</ScoreNumber>
              <StarRating rating={processedSummary.averageRating} size="large" readonly />
              {processedSummary.ratingTrend !== 0 && (
                <TrendIndicator positive={processedSummary.ratingTrend > 0}>
                  {processedSummary.ratingTrend > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                  {Math.abs(processedSummary.ratingTrend).toFixed(1)}
                </TrendIndicator>
              )}
            </RatingScore>
            
            <RatingDetails>
              <p>Based on {processedSummary.totalReviews} reviews</p>
              <p>{processedSummary.recommendationRate}% would recommend</p>
            </RatingDetails>
          </MainRatingCard>

          <DistributionCard>
            <h3>Rating Distribution</h3>
            <DistributionBars>
              {[5, 4, 3, 2, 1].map(rating => (
                <DistributionRow key={rating}>
                  <RatingLabel>{rating} star</RatingLabel>
                  <DistributionBar>
                    <DistributionFill 
                      width={processedSummary.ratingPercentages[rating]}
                      color={getRatingColor(rating)}
                    />
                  </DistributionBar>
                  <DistributionPercentage>
                    {processedSummary.ratingPercentages[rating].toFixed(1)}%
                  </DistributionPercentage>
                  <DistributionCount>
                    ({processedSummary.ratingDistribution[rating] || 0})
                  </DistributionCount>
                </DistributionRow>
              ))}
            </DistributionBars>
          </DistributionCard>

          <StatsCard>
            <StatItem>
              <FiMessageSquare size={20} />
              <StatValue>{processedSummary.totalReviews}</StatValue>
              <StatLabel>Total Reviews</StatLabel>
            </StatItem>
          </StatsCard>

          <StatsCard>
            <StatItem>
              <FiThumbsUp size={20} />
              <StatValue>{processedSummary.responseRate}%</StatValue>
              <StatLabel>Response Rate</StatLabel>
            </StatItem>
          </StatsCard>
        </MetricsGrid>

        <InsightsSection>
          <InsightsTabs>
            <TabButton 
              active={selectedMetric === 'compliments'} 
              onClick={() => setSelectedMetric('compliments')}
            >
              Top Compliments
            </TabButton>
            <TabButton 
              active={selectedMetric === 'concerns'} 
              onClick={() => setSelectedMetric('concerns')}
            >
              Common Concerns
            </TabButton>
          </InsightsTabs>
          
          <InsightsContent>
            {selectedMetric === 'compliments' && (
              <ComplimentsList>
                {processedSummary.topCompliments.map((compliment, index) => (
                  <ComplimentItem key={index}>
                    <ComplimentText>{compliment.text}</ComplimentText>
                    <ComplimentStats>
                      <MentionCount>Mentioned {compliment.count} times</MentionCount>
                      <ComplimentBar>
                        <ComplimentFill 
                          width={(compliment.count / processedSummary.topCompliments[0].count) * 100}
                        />
                      </ComplimentBar>
                    </ComplimentStats>
                  </ComplimentItem>
                ))}
              </ComplimentsList>
            )}
            
            {selectedMetric === 'concerns' && (
              <ConcernsList>
                {processedSummary.commonConcerns.map((concern, index) => (
                  <ConcernItem key={index}>
                    <ConcernText>{concern.text}</ConcernText>
                    <ConcernCount>{concern.count} mentions</ConcernCount>
                  </ConcernItem>
                ))}
              </ConcernsList>
            )}
          </InsightsContent>
        </InsightsSection>
      </OverviewPanel>
    );
  };

  const ReviewCard = ({ review, isSelected, onSelect }) => {
    const [showFullReview, setShowFullReview] = useState(false);
    const isLongReview = review.comment.length > 200;
    const displayedText = showFullReview || !isLongReview 
      ? review.comment 
      : review.comment.substring(0, 200) + '...';

    return (
      <ReviewCardContainer selected={isSelected}>
        <ReviewHeader>
          <ReviewSelection>
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={onSelect}
            />
          </ReviewSelection>
          
          <PatientInfo>
            <PatientAvatar>
              <div className="avatar-fallback">
                {review.patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              {review.verified && (
                <VerifiedBadge title="Verified Patient">
                  <FiShield size={10} />
                </VerifiedBadge>
              )}
            </PatientAvatar>
            
            <PatientDetails>
              <PatientName>{review.patient.name}</PatientName>
              <PatientType>
                {review.patient.isReturning ? 'Returning Patient' : 'New Patient'}
              </PatientType>
              <ReviewDate>{formatRelativeDate(review.createdAt)}</ReviewDate>
            </PatientDetails>
          </PatientInfo>
          
          <ReviewRating>
            <StarRating rating={review.rating} size="medium" readonly />
            <RatingText>{review.rating}/5</RatingText>
          </ReviewRating>
          
          <ReviewActions>
            <DropdownButton>
              <FiMoreVertical size={16} />
            </DropdownButton>
          </ReviewActions>
        </ReviewHeader>

        <ReviewContent>
          {review.appointmentType && (
            <AppointmentContext>
              <span className="appointment-type">{review.appointmentType}</span>
              <span className="appointment-date">
                {formatDate(review.appointmentDate)}
              </span>
            </AppointmentContext>
          )}

          <ReviewText>
            <p>{displayedText}</p>
            
            {isLongReview && (
              <ReadMoreButton onClick={() => setShowFullReview(!showFullReview)}>
                {showFullReview ? 'Show Less' : 'Read More'}
              </ReadMoreButton>
            )}
          </ReviewText>

          {review.tags && review.tags.length > 0 && (
            <ReviewTags>
              {review.tags.map(tag => (
                <ReviewTag key={tag}>{tag}</ReviewTag>
              ))}
            </ReviewTags>
          )}

          {review.response && (
            <DoctorResponse>
              <ResponseHeader>
                <ResponseAuthor>
                  <FiShield size={14} />
                  <span>Dr. Response</span>
                </ResponseAuthor>
                <ResponseDate>{formatRelativeDate(review.response.createdAt)}</ResponseDate>
                <ResponseEditButton 
                  onClick={() => {
                    setSelectedReview(review);
                    setReplyModalOpen(true);
                  }}
                >
                  <FiEdit3 size={12} />
                </ResponseEditButton>
              </ResponseHeader>
              <ResponseContent>
                <p>{review.response.text}</p>
              </ResponseContent>
            </DoctorResponse>
          )}

          <ReviewFooter>
            <ReviewHelpfulness>
              <span>Helpful to {review.helpfulVotes || 0} patients</span>
            </ReviewHelpfulness>
            
            <ReviewStatus>
              {!review.response && (
                <StatusPending>Response Pending</StatusPending>
              )}
              {review.featured && (
                <StatusFeatured>Featured Review</StatusFeatured>
              )}
              {review.reported && (
                <StatusReported>Reported</StatusReported>
              )}
            </ReviewStatus>
          </ReviewFooter>
        </ReviewContent>

        <ReviewCardActions>
          {!review.response && (
            <ActionButton 
              variant="primary"
              onClick={() => {
                setSelectedReview(review);
                setReplyModalOpen(true);
              }}
            >
              <FiMessageSquare size={14} />
              Reply
            </ActionButton>
          )}
          <ActionButton variant="secondary">
            <FiShare2 size={14} />
            Share
          </ActionButton>
          <ActionButton variant="ghost">
            <FiFlag size={14} />
            Report
          </ActionButton>
        </ReviewCardActions>
      </ReviewCardContainer>
    );
  };

  const ReplyModal = () => {
    const [responseText, setResponseText] = useState(
      selectedReview?.response?.text || ''
    );
    const [submitting, setSubmitting] = useState(false);

    const templates = [
      {
        id: 'thank_positive',
        name: 'Thank You (Positive Review)',
        text: "Thank you so much for your kind words and for taking the time to share your experience. It means a lot to know that you felt well cared for during your visit. I'm committed to providing the best possible care for all my patients."
      },
      {
        id: 'address_concern',
        name: 'Address Concern',
        text: "Thank you for your feedback. I take all patient concerns seriously and would like the opportunity to discuss this further with you. Please feel free to contact my office directly so we can address your concerns and improve your experience."
      },
      {
        id: 'grateful_general',
        name: 'General Gratitude',
        text: "Thank you for choosing our practice and for taking the time to leave a review. Your feedback helps us continue to improve our services and provide better care for all our patients."
      }
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!responseText.trim()) return;

      setSubmitting(true);
      try {
        await handleReviewReply(selectedReview.id, responseText);
      } finally {
        setSubmitting(false);
      }
    };

    if (!replyModalOpen || !selectedReview) return null;

    return (
      <ModalOverlay onClick={() => setReplyModalOpen(false)}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <h2>{selectedReview.response ? 'Edit Response' : 'Reply to Review'}</h2>
            <CloseButton onClick={() => setReplyModalOpen(false)}>
              <FiX size={20} />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            <OriginalReview>
              <h3>Original Review</h3>
              <ReviewSummary>
                <StarRating rating={selectedReview.rating} readonly />
                <span>{selectedReview.patient.name}</span>
                <span>{formatDate(selectedReview.createdAt)}</span>
              </ReviewSummary>
              <p>{selectedReview.comment}</p>
            </OriginalReview>

            <div>
              <TemplateSelector>
                <label>Quick Templates:</label>
                <TemplateButtons>
                  {templates.map(template => (
                    <TemplateButton
                      key={template.id}
                      type="button"
                      onClick={() => setResponseText(template.text)}
                    >
                      {template.name}
                    </TemplateButton>
                  ))}
                </TemplateButtons>
              </TemplateSelector>

              <ResponseInput>
                <label htmlFor="response">Your Response:</label>
                <textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write a professional and empathetic response..."
                  rows={6}
                  maxLength={1000}
                  required
                />
                <CharacterCount>
                  {responseText.length}/1000 characters
                </CharacterCount>
              </ResponseInput>

              <ResponseTips>
                <h4>Response Tips:</h4>
                <ul>
                  <li>Thank the patient for their feedback</li>
                  <li>Address specific concerns mentioned</li>
                  <li>Keep the tone professional and empathetic</li>
                  <li>Avoid sharing medical details</li>
                  <li>Invite them to contact you directly if needed</li>
                </ul>
              </ResponseTips>

              <ModalActions>
                <SecondaryButton 
                  type="button" 
                  onClick={() => setReplyModalOpen(false)}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : selectedReview.response ? 'Update Response' : 'Submit Response'}
                </PrimaryButton>
              </ModalActions>
            </div>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            Reviews & Ratings
            {processedSummary && (
              <RatingBadge>
                <FiStar size={16} />
                {processedSummary.formattedAverage}
              </RatingBadge>
            )}
          </Title>
          <Subtitle>Monitor and manage patient feedback and ratings</Subtitle>
        </HeaderContent>
        
        <HeaderActions>
          <RefreshButton onClick={() => { loadRatingSummary(); loadReviews(); }}>
            <FiRefreshCw size={16} />
            Refresh
          </RefreshButton>
          <ExportButton>
            <FiDownload size={16} />
            Export
          </ExportButton>
          <ShareButton>
            <FiShare2 size={16} />
            Share Profile
          </ShareButton>
        </HeaderActions>
      </Header>

      <Content>
        <RatingOverviewPanel />
        
        <ReviewsListPanel>
          <ReviewsHeader>
            <h2>Patient Reviews ({reviews.length})</h2>
            
            <ReviewsActions>
              {selectedReviews.length > 0 && (
                <BulkActionsInfo>
                  {selectedReviews.length} selected
                </BulkActionsInfo>
              )}
            </ReviewsActions>
          </ReviewsHeader>

          <ReviewFilters>
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="Search reviews by patient name or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon>
                <FiSearch size={16} />
              </SearchIcon>
            </SearchContainer>

            <FilterControls>
              <FilterSelect
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </FilterSelect>

              <FilterSelect
                value={filters.hasResponse}
                onChange={(e) => setFilters(prev => ({ ...prev, hasResponse: e.target.value }))}
              >
                <option value="all">All Reviews</option>
                <option value="yes">With Response</option>
                <option value="no">Needs Response</option>
              </FilterSelect>

              <SortSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="rating_desc">Highest Rating</option>
                <option value="rating_asc">Lowest Rating</option>
                <option value="helpful_desc">Most Helpful</option>
              </SortSelect>
            </FilterControls>
          </ReviewFilters>

          <ReviewsList>
            {loading.reviews ? (
              <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Loading reviews...</LoadingText>
              </LoadingContainer>
            ) : reviews.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <FiMessageSquare size={48} />
                </EmptyIcon>
                <EmptyTitle>No reviews found</EmptyTitle>
                <EmptyMessage>
                  {searchQuery || Object.values(filters).some(f => f !== 'all')
                    ? "Try adjusting your search or filters"
                    : "No patient reviews yet. Reviews will appear here once patients start leaving feedback."
                  }
                </EmptyMessage>
              </EmptyState>
            ) : (
              <>
                <ResultsInfo>
                  Showing {reviews.length} reviews
                  {searchQuery && ` matching "${searchQuery}"`}
                </ResultsInfo>
                
                {reviews.map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isSelected={selectedReviews.includes(review.id)}
                    onSelect={() => {
                      setSelectedReviews(prev =>
                        prev.includes(review.id)
                          ? prev.filter(id => id !== review.id)
                          : [...prev, review.id]
                      );
                    }}
                  />
                ))}
              </>
            )}
          </ReviewsList>
        </ReviewsListPanel>
      </Content>

      <ReplyModal />
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
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #6366f1 100%);
  color: white;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const RatingBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const RefreshButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ExportButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ShareButton = styled(Button)`
  background: rgba(255, 255, 255, 0.15);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  flex: 1;
  overflow: hidden;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
`;

const OverviewPanel = styled.div`
  background: ${theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
`;

const OverviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 18px;
    color: ${theme.colors.gray[900]};
  }
`;

const DateRangeInfo = styled.span`
  font-size: 12px;
  color: ${theme.colors.gray[600]};
  background: white;
  padding: 4px 8px;
  border-radius: 6px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const MainRatingCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  grid-column: 1 / -1;
`;

const RatingScore = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
`;

const ScoreNumber = styled.span`
  font-size: 36px;
  font-weight: 700;
  color: ${theme.colors.gray[900]};
`;

const TrendIndicator = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.positive ? theme.colors.success : theme.colors.danger};
`;

const RatingDetails = styled.div`
  p {
    margin: 2px 0;
    font-size: 14px;
    color: ${theme.colors.gray[600]};
  }
`;

const DistributionCard = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  h3 {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: ${theme.colors.gray[900]};
  }
`;

const DistributionBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DistributionRow = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr 40px 30px;
  align-items: center;
  gap: 8px;
  font-size: 12px;
`;

const RatingLabel = styled.span`
  color: ${theme.colors.gray[600]};
`;

const DistributionBar = styled.div`
  height: 8px;
  background: ${theme.colors.gray[200]};
  border-radius: 4px;
  overflow: hidden;
`;

const DistributionFill = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.color};
  transition: width 0.3s ease;
`;

const DistributionPercentage = styled.span`
  color: ${theme.colors.gray[700]};
  font-weight: 500;
  text-align: right;
`;

const DistributionCount = styled.span`
  color: ${theme.colors.gray[500]};
  text-align: right;
`;

const StatsCard = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: ${theme.colors.primary};
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin: 8px 0 4px 0;
  color: ${theme.colors.gray[900]};
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray[600]};
`;

const InsightsSection = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const InsightsTabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const TabButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: ${props => props.active ? 'white' : theme.colors.gray[50]};
  color: ${props => props.active ? theme.colors.primary : theme.colors.gray[600]};
  font-weight: ${props => props.active ? '600' : '500'};
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;

  &:hover {
    background: ${props => props.active ? 'white' : theme.colors.gray[100]};
  }
`;

const InsightsContent = styled.div`
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
`;

const ComplimentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ComplimentItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ComplimentText = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${theme.colors.gray[900]};
`;

const ComplimentStats = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MentionCount = styled.span`
  font-size: 11px;
  color: ${theme.colors.gray[600]};
  min-width: 100px;
`;

const ComplimentBar = styled.div`
  flex: 1;
  height: 6px;
  background: ${theme.colors.gray[200]};
  border-radius: 3px;
  overflow: hidden;
`;

const ComplimentFill = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background: ${theme.colors.success};
  transition: width 0.3s ease;
`;

const ConcernsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ConcernItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: ${theme.colors.gray[50]};
  border-radius: 6px;
`;

const ConcernText = styled.span`
  font-size: 13px;
  color: ${theme.colors.gray[900]};
`;

const ConcernCount = styled.span`
  font-size: 11px;
  color: ${theme.colors.gray[600]};
  background: white;
  padding: 2px 6px;
  border-radius: 8px;
`;

const ReviewsListPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ReviewsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 18px;
    color: ${theme.colors.gray[900]};
  }
`;

const ReviewsActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const BulkActionsInfo = styled.span`
  font-size: 13px;
  color: ${theme.colors.primary};
  font-weight: 500;
`;

const ReviewFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.gray[400]};
`;

const FilterControls = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  min-width: 140px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const ReviewsList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ResultsInfo = styled.div`
  font-size: 13px;
  color: ${theme.colors.gray[600]};
  margin-bottom: 16px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${theme.colors.gray[200]};
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: ${theme.colors.gray[600]};
  font-size: 14px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  color: ${theme.colors.gray[400]};
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  color: ${theme.colors.gray[900]};
  font-size: 18px;
`;

const EmptyMessage = styled.p`
  margin: 0;
  color: ${theme.colors.gray[600]};
  font-size: 14px;
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
`;

const StarContainer = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.div`
  color: ${props => props.filled ? '#fbbf24' : theme.colors.gray[300]};
  transition: color 0.2s;
`;

const ReviewCardContainer = styled.div`
  border: 1px solid ${props => props.selected ? theme.colors.primary : theme.colors.gray[200]};
  border-radius: 12px;
  padding: 16px;
  background: white;
  transition: all 0.2s;
  ${props => props.selected && `box-shadow: 0 0 0 1px ${theme.colors.primary}20;`}

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ReviewSelection = styled.div`
  input[type="checkbox"] {
    cursor: pointer;
  }
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const PatientAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;

  .avatar-fallback {
    display: flex;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, ${theme.colors.primary}, #6366f1);
    color: white;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
  }
`;

const VerifiedBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: ${theme.colors.success};
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
`;

const PatientDetails = styled.div``;

const PatientName = styled.div`
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin-bottom: 2px;
  font-size: 14px;
`;

const PatientType = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray[600]};
  margin-bottom: 2px;
`;

const ReviewDate = styled.div`
  font-size: 11px;
  color: ${theme.colors.gray[500]};
`;

const ReviewRating = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RatingText = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${theme.colors.gray[700]};
`;

const ReviewActions = styled.div``;

const DropdownButton = styled.button`
  padding: 4px;
  border: none;
  background: none;
  color: ${theme.colors.gray[500]};
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background: ${theme.colors.gray[100]};
  }
`;

const ReviewContent = styled.div`
  margin-bottom: 12px;
`;

const AppointmentContext = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;

  .appointment-type {
    background: ${theme.colors.primary}10;
    color: ${theme.colors.primary};
    padding: 2px 6px;
    border-radius: 8px;
    font-weight: 500;
  }

  .appointment-date {
    color: ${theme.colors.gray[600]};
  }
`;

const ReviewText = styled.div`
  margin-bottom: 12px;

  p {
    margin: 0;
    font-size: 14px;
    color: ${theme.colors.gray[700]};
    line-height: 1.5;
  }
`;

const ReadMoreButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  cursor: pointer;
  font-size: 13px;
  margin-top: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

const ReviewTags = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const ReviewTag = styled.span`
  background: ${theme.colors.gray[100]};
  color: ${theme.colors.gray[700]};
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
`;

const DoctorResponse = styled.div`
  background: ${theme.colors.gray[50]};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border-left: 3px solid ${theme.colors.primary};
`;

const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ResponseAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.primary};
`;

const ResponseDate = styled.div`
  font-size: 11px;
  color: ${theme.colors.gray[500]};
`;

const ResponseEditButton = styled.button`
  padding: 4px;
  border: none;
  background: none;
  color: ${theme.colors.gray[500]};
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background: ${theme.colors.gray[200]};
  }
`;

const ResponseContent = styled.div`
  p {
    margin: 0;
    font-size: 13px;
    color: ${theme.colors.gray[700]};
    line-height: 1.4;
  }
`;

const ReviewFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ReviewHelpfulness = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray[600]};
`;

const ReviewStatus = styled.div`
  display: flex;
  gap: 6px;
`;

const StatusPending = styled.span`
  background: ${theme.colors.warning}20;
  color: ${theme.colors.warning};
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
`;

const StatusFeatured = styled.span`
  background: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
`;

const StatusReported = styled.span`
  background: ${theme.colors.danger}20;
  color: ${theme.colors.danger};
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
`;

const ReviewCardActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary}10;
          border-color: ${theme.colors.primary}30;
          color: ${theme.colors.primary};
          &:hover { background: ${theme.colors.primary}20; }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.gray[100]};
          border-color: ${theme.colors.gray[300]};
          color: ${theme.colors.gray[700]};
          &:hover { background: ${theme.colors.gray[200]}; }
        `;
      case 'ghost':
        return `
          background: transparent;
          border-color: ${theme.colors.gray[300]};
          color: ${theme.colors.gray[600]};
          &:hover { background: ${theme.colors.gray[100]}; }
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          border-color: ${theme.colors.gray[300]};
          color: ${theme.colors.gray[700]};
          &:hover { background: ${theme.colors.gray[200]}; }
        `;
    }
  }}
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${theme.colors.gray[200]};

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${theme.colors.gray[900]};
  }
`;

const CloseButton = styled.button`
  padding: 4px;
  border: none;
  background: none;
  color: ${theme.colors.gray[500]};
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background: ${theme.colors.gray[100]};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const OriginalReview = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: ${theme.colors.gray[50]};
  border-radius: 8px;

  h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: ${theme.colors.gray[900]};
  }

  p {
    margin: 8px 0 0 0;
    font-size: 13px;
    color: ${theme.colors.gray[700]};
    line-height: 1.4;
  }
`;

const ReviewSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;
  color: ${theme.colors.gray[600]};
`;

const TemplateSelector = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    color: ${theme.colors.gray[700]};
  }
`;

const TemplateButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const TemplateButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  background: white;
  color: ${theme.colors.gray[700]};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.gray[50]};
    border-color: ${theme.colors.primary};
  }
`;

const ResponseInput = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: ${theme.colors.gray[700]};
  }

  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid ${theme.colors.gray[300]};
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    min-height: 120px;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 3px ${theme.colors.primary}20;
    }
  }
`;

const CharacterCount = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray[500]};
  text-align: right;
  margin-top: 4px;
`;

const ResponseTips = styled.div`
  background: ${theme.colors.gray[50]};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;

  h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: ${theme.colors.gray[900]};
  }

  ul {
    margin: 0;
    padding-left: 16px;
    
    li {
      font-size: 13px;
      color: ${theme.colors.gray[600]};
      margin-bottom: 4px;
    }
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const SecondaryButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  background: white;
  color: ${theme.colors.gray[700]};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.gray[50]};
  }
`;

const PrimaryButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${theme.colors.primary};
  border-radius: 6px;
  background: ${theme.colors.primary};
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primary}dd;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default ReviewsManagement;