def identify_churn_reason(row: dict) -> str:
    if row.get('Contract_Month-to-month') == 1 and row.get('MonthlyCharges', 0) > 70:
        return 'high_bill'
    elif row.get('Contract_Month-to-month') == 1 and row.get('tenure', 0) < 12:
        return 'new_customer_risk'
    elif row.get('InternetService_Fiber optic') == 1 and row.get('TechSupport') == 0:
        return 'service_quality'
    elif row.get('Contract_Month-to-month') == 1 and row.get('tenure', 0) > 24:
        return 'loyalty_risk'
    elif row.get('OnlineSecurity') == 0 and row.get('OnlineBackup') == 0:
        return 'missing_features'
    else:
        return 'general_risk'


def generate_retention_offer(reason: str) -> dict:
    offers = {
        'high_bill': {
            'offer': '20% discount on current plan for 6 months',
            'type': 'Discount',
            'priority': 'High'
        },
        'new_customer_risk': {
            'offer': 'Free premium support + 2 months discount',
            'type': 'Onboarding Support',
            'priority': 'High'
        },
        'service_quality': {
            'offer': 'Free TechSupport upgrade for 3 months',
            'type': 'Service Upgrade',
            'priority': 'Medium'
        },
        'loyalty_risk': {
            'offer': 'Loyalty reward — free device upgrade or 30% off annual plan',
            'type': 'Loyalty Reward',
            'priority': 'High'
        },
        'missing_features': {
            'offer': 'Free OnlineSecurity + OnlineBackup for 3 months',
            'type': 'Feature Unlock',
            'priority': 'Medium'
        },
        'general_risk': {
            'offer': 'Personalized call from retention team',
            'type': 'Human Outreach',
            'priority': 'Low'
        }
    }
    return offers[reason]