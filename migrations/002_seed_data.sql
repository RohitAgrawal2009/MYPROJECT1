-- ==========================================================
-- JOBBOND DEMO SEED DATA (Indian Context)
-- ==========================================================

-- Insert Service Categories
INSERT INTO service_categories (id, name, name_hi, slug, icon, description, description_hi, is_active, display_order)
VALUES
('c1000000-0000-0000-0000-000000000001', 'Electrician', 'इलेक्ट्रीशियन', 'electrician', 'Zap', 'Wiring, inverter repair, MCB fix, fan installation, switchboard repair', 'वायरिंग, इन्वर्टर रिपेयर, पंखा लगाना, स्विचबोर्ड मरम्मत', true, 1),
('c1000000-0000-0000-0000-000000000002', 'Plumber', 'प्लंबर (नलसाज)', 'plumber', 'Droplets', 'Pipe leakage, tap fitting, motor installation, bathroom sanitary work', 'पाइप लीकेज, नल फिटिंग, मोटर इंस्टॉलेशन, बाथरूम सेनेटरी कार्य', true, 2),
('c1000000-0000-0000-0000-000000000003', 'Carpenter', 'बढ़ई', 'carpenter', 'Hammer', 'Furniture repair, door locks, modular kitchen woodwork, custom shelves', 'फर्नीचर मरम्मत, दरवाजे के ताले, मॉड्यूलर किचन, अलमारी कार्य', true, 3),
('c1000000-0000-0000-0000-000000000004', 'Painter', 'पेंटर', 'painter', 'Paintbrush', 'Interior wall painting, waterproofing, putty & primer, exterior emulsion', 'दीवार पेंटिंग, वाटरप्रूफिंग, पुट्टी और प्राइमर, बाहरी पेंट', true, 4),
('c1000000-0000-0000-0000-000000000005', 'Cleaner', 'सफाई कर्मचारी', 'cleaner', 'Sparkles', 'Deep house cleaning, kitchen scrubbing, sofa shampooing, office sanitization', 'घर की गहरी सफाई, किचन धुलाई, सोफा शैम्पू, ऑफिस सैनिटाइजेशन', true, 5),
('c1000000-0000-0000-0000-000000000006', 'Tutor', 'ट्यूटर / शिक्षक', 'tutor', 'GraduationCap', 'Home tuitions, mathematics, science, language coaching, competitive prep', 'होम ट्यूशन, गणित, विज्ञान, भाषा कोचिंग, प्रतियोगी परीक्षा तैयारी', true, 6),
('c1000000-0000-0000-0000-000000000007', 'Agricultural Worker', 'कृषि श्रमिक', 'agricultural-worker', 'Wheat', 'Harvesting, field weeding, sowing, irrigation assistance, tractor operation', 'फसल कटाई, निराई-गुड़ाई, बुवाई, सिंचाई सहायता, ट्रैक्टर संचालन', true, 7),
('c1000000-0000-0000-0000-000000000008', 'General Labour', 'सामान्य मजदूर', 'general-labour', 'Users', 'Loading & unloading, site shifting, construction helper, event logistics', 'सामान चढ़ाना-उतारना, शिफ्टिंग, निर्माण सहायक, इवेंट लॉजिस्टिक्स', true, 8),
('c1000000-0000-0000-0000-000000000009', 'Appliance Repair', 'उपकरण मरम्मत', 'appliance-repair', 'Wrench', 'AC servicing, refrigerator gas recharge, washing machine & microwave repair', 'एसी सर्विसिंग, फ्रिज गैस चार्ज, वाशिंग मशीन व माइक्रोवेव मरम्मत', true, 9)
ON CONFLICT (slug) DO NOTHING;
