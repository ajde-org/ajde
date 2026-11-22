-- Both entry points start one import and become available together.
update public.ai_admission_features set weight = 8 where feature = 'parse';
