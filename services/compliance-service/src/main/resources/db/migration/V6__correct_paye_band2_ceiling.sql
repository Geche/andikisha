-- Correct the Kenya PAYE band-2 monthly ceiling from 32,300 to the KRA-gazetted 32,333.
-- KRA: the second band is the next KES 8,333 after the first 24,000 (24,001–32,333 @ 25%);
-- annual 388,000 ÷ 12 = 32,333.33, gazetted monthly ceiling 32,333. The original V4 seed used
-- 32,300 (an incorrect 387,600 ÷ 12 basis). V4 is left untouched (already-applied migration);
-- this migration corrects the seeded data forward. See KenyanTaxCalculator.BAND_2_LIMIT.
UPDATE tax_brackets
   SET upper_bound = 32333
 WHERE tenant_id = 'SYSTEM' AND country = 'KE' AND band_number = 2
   AND upper_bound = 32300;

UPDATE tax_brackets
   SET lower_bound = 32333.01
 WHERE tenant_id = 'SYSTEM' AND country = 'KE' AND band_number = 3
   AND lower_bound = 32300.01;
