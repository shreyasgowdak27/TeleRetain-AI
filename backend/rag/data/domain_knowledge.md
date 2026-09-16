RISK TIERS
- Low risk: Customer shows strong retention indicators and low predicted churn probability from the model.
- Medium risk: Customer shows some churn warning signs but not severe.
- High risk: Customer shows strong churn indicators based on the model's prediction — immediate retention action is recommended.

CHURN REASON CATEGORIES
TeleRetain AI checks each customer against six rules, in order, and assigns the FIRST one that matches:
1. high_bill — Customer is on a Month-to-month contract AND pays over ₹70/month. Flagged as price-sensitive.
2. new_customer_risk — Customer is on a Month-to-month contract AND has been with the company under 12 months. New customers on flexible contracts are highest flight risk.
3. service_quality — Customer has Fiber optic internet but no Tech Support add-on. Lack of support on a premium service tends to frustrate customers.
4. loyalty_risk — Customer is on a Month-to-month contract AND has been with the company over 24 months. Despite long tenure, they've never committed to a fixed contract — a specific "loyal but unlocked" risk pattern.
5. missing_features — Customer has neither Online Security nor Online Backup add-ons. Fewer add-ons mean fewer reasons to stay.
6. general_risk — None of the above patterns matched, but the model still flagged elevated churn risk. Requires human judgment.

IMPORTANT: These checks run in order, and a customer only gets ONE reason — whichever rule they match FIRST. For example, a customer matching both "high_bill" and "missing_features" conditions would be labeled high_bill only, since that check runs first.

RETENTION OFFER MAPPING
Each reason maps to exactly one offer:
- high_bill → 20% discount on current plan for 6 months (Type: Discount, Priority: High)
- new_customer_risk → Free premium support + 2 months discount (Type: Onboarding Support, Priority: High)
- service_quality → Free TechSupport upgrade for 3 months (Type: Service Upgrade, Priority: Medium)
- loyalty_risk → Loyalty reward — free device upgrade or 30% off annual plan (Type: Loyalty Reward, Priority: High)
- missing_features → Free OnlineSecurity + OnlineBackup for 3 months (Type: Feature Unlock, Priority: Medium)
- general_risk → Personalized call from retention team (Type: Human Outreach, Priority: Low)

HOW THE MODEL WORKS (for new agents)
TeleRetain AI uses a Random Forest machine learning model trained on historical telecom customer data (27 encoded features — contract type, tenure, charges, services, demographics). The model outputs a churn probability, which is converted into a risk tier (Low/Medium/High). Separately, a rule-based reason engine (not the ML model itself) explains WHY by checking the six patterns above in order and picking the first match. The offer is then automatically determined by that reason.