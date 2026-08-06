import React from 'react';
import { Grid, Card, CardContent, Box, Typography, Chip } from '@mui/material';

/**
 * Modern, vibrant KPI Statistics Cards for Admin Dashboard.
 */
export default function StatsCards({ cards }) {
  return (
    <Box mb={4}>
      <Grid container spacing={3}>
        {cards.map((card, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={idx}>
            <Card
              elevation={0}
              sx={{
                background: '#FFFFFF',
                borderRadius: 3.5,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
                  borderColor: card.color || '#E31837',
                },
              }}
            >
              {/* Top Accent Line */}
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: card.color || '#111' }} />

              <CardContent sx={{ p: 3, pt: 3.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>
                    {card.label}
                  </Typography>
                  <Box
                    sx={{
                      width: 48, height: 48, borderRadius: 2.5,
                      background: `${card.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: card.color,
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  >
                    {React.cloneElement(card.icon, { sx: { fontSize: 26 } })}
                  </Box>
                </Box>

                <Typography variant="h3" fontWeight={900} color="#111111" sx={{ letterSpacing: '-0.5px' }}>
                  {card.value !== undefined ? card.value.toLocaleString() : 0}
                </Typography>

                {card.sub && (
                  <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                      label={card.sub}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        bgcolor: '#F1F5F9',
                        color: '#475569',
                        borderRadius: 1.5,
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
