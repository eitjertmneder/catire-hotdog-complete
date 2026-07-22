import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Survey {
  id: string;
  name: string;
  questions: SurveyQuestion[];
  active: boolean;
  created_at: Date;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'rating' | 'text' | 'multiple_choice' | 'yes_no';
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  order_id?: string;
  user_id?: number;
  answers: { question_id: string; value: string | number }[];
  submitted_at: Date;
  branch_id: number;
}

type SurveyState = {
  surveys: Survey[];
  responses: SurveyResponse[];
  addSurvey: (survey: Omit<Survey, 'id' | 'created_at'>) => void;
  updateSurvey: (id: string, updates: Partial<Survey>) => void;
  deleteSurvey: (id: string) => void;
  toggleSurvey: (id: string) => void;
  submitResponse: (response: Omit<SurveyResponse, 'id' | 'submitted_at'>) => void;
  getSurveyById: (id: string) => Survey | undefined;
  getResponsesBySurvey: (surveyId: string) => SurveyResponse[];
  getSurveyAnalytics: (surveyId: string) => {
    total_responses: number;
    average_ratings: Record<string, number>;
    text_answers: Record<string, string[]>;
    completion_rate: number;
  };
};

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      surveys: [
        {
          id: 'default_satisfaction',
          name: 'Encuesta de Satisfacción',
          questions: [
            { id: 'q1', text: '¿Cómo calificarías tu experiencia?', type: 'rating', required: true },
            { id: 'q2', text: '¿El pedido estuvo a tiempo?', type: 'yes_no', required: true },
            { id: 'q3', text: '¿Qué te gustó más?', type: 'text', required: false },
            { id: 'q4', text: '¿Qué podríamos mejorar?', type: 'text', required: false },
          ],
          active: true,
          created_at: new Date(),
        },
      ],
      responses: [],

      addSurvey: (survey) => {
        const newSurvey: Survey = {
          ...survey,
          id: Date.now().toString(),
          created_at: new Date(),
        };
        set((state) => ({ surveys: [...state.surveys, newSurvey] }));
      },

      updateSurvey: (id, updates) => {
        set((state) => ({
          surveys: state.surveys.map(s =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteSurvey: (id) => {
        set((state) => ({
          surveys: state.surveys.filter(s => s.id !== id),
        }));
      },

      toggleSurvey: (id) => {
        set((state) => ({
          surveys: state.surveys.map(s =>
            s.id === id ? { ...s, active: !s.active } : s
          ),
        }));
      },

      submitResponse: (response) => {
        const newResponse: SurveyResponse = {
          ...response,
          id: Date.now().toString(),
          submitted_at: new Date(),
        };
        set((state) => ({
          responses: [...state.responses, newResponse],
        }));
      },

      getSurveyById: (id) => {
        return get().surveys.find(s => s.id === id);
      },

      getResponsesBySurvey: (surveyId) => {
        return get().responses.filter(r => r.survey_id === surveyId);
      },

      getSurveyAnalytics: (surveyId) => {
        const responses = get().getResponsesBySurvey(surveyId);
        const survey = get().getSurveyById(surveyId);
        
        const averageRatings: Record<string, number> = {};
        const textAnswers: Record<string, string[]> = {};

        survey?.questions.forEach(q => {
          if (q.type === 'rating') {
            const ratings = responses
              .map(r => r.answers.find(a => a.question_id === q.id)?.value as number)
              .filter(v => v !== undefined);
            averageRatings[q.id] = ratings.length > 0
              ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
              : 0;
          } else if (q.type === 'text') {
            textAnswers[q.id] = responses
              .map(r => r.answers.find(a => a.question_id === q.id)?.value as string)
              .filter(v => v !== undefined && v !== '');
          }
        });

        return {
          total_responses: responses.length,
          average_ratings: averageRatings,
          text_answers: textAnswers,
          completion_rate: responses.length > 0 ? 100 : 0,
        };
      },
    }),
    {
      name: 'survey-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
