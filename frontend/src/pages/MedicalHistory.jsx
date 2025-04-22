import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Alert, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Layout } from '../components';
import { chatService } from '../services/api';

const MedicalHistory = () => {
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        setLoading(true);
        const response = await chatService.getMedicalHistory();
        
        if (response.success) {
          setMedicalHistory(response.medicalHistory);
        } else {
          throw new Error("Failed to fetch medical history");
        }
      } catch (error) {
        console.error('Error fetching medical history:', error);
        setError('فشل في الحصول على السجل الطبي. يرجى المحاولة مرة أخرى لاحقًا.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, []);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  };

  if (loading) {
    return (
      <Layout title="السجل الطبي">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="السجل الطبي">
        <Alert severity="error" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
          {error}
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout title="السجل الطبي">
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" align="center" color="primary" gutterBottom>
            السجل الطبي الخاص بك
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            هنا يمكنك الاطلاع على جميع استشاراتك الطبية السابقة
          </Typography>
        </Paper>

        {medicalHistory.length === 0 ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              لا توجد استشارات طبية سابقة
            </Typography>
          </Paper>
        ) : (
          medicalHistory.map((session, index) => {
            // Generate title from first conversation question if available
            const firstQuestion = session.conversations[0]?.question;
            const contextTitle = session.contextTitle || 
                                 (firstQuestion?.length > 30 ? firstQuestion.substring(0, 30) + "..." : firstQuestion) || 
                                 `استشارة طبية ${index + 1}`;
            
            return (
              <Accordion key={session.sessionId} sx={{ mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index}-content`}
                  id={`panel${index}-header`}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {contextTitle} - {formatDate(session.startDate)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: '#f9f9f9' }}>
                  {session.conversations.map((conversation, convIndex) => (
                    <Box key={convIndex} sx={{ mb: 2 }}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" color="primary.dark" fontWeight="bold">
                          سؤالك:
                        </Typography>
                        <Typography variant="body1">{conversation.question}</Typography>
                      </Box>
                      
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" color="secondary.dark" fontWeight="bold">
                          رد المساعد الطبي:
                        </Typography>
                        <Typography variant="body1">{conversation.response}</Typography>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" display="block">
                        {formatDate(conversation.timestamp)}
                      </Typography>
                      
                      {convIndex < session.conversations.length - 1 && (
                        <Divider sx={{ my: 2 }} />
                      )}
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>
    </Layout>
  );
};

export default MedicalHistory;
