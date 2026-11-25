import {CalendarClock} from 'lucide-react';

import {EmptyState} from '@grov/ui';

/** Shown when "Meal plans" is chosen: no order records a meal plan yet, so there is nothing to count. */
export function MealPlanNotice({what}: {what: 'orders' | 'revenue'}) {
  return (
    <EmptyState
      icon={<CalendarClock />}
      title={`Meal plan ${what} aren’t tracked yet`}
      description="An order doesn’t record a meal plan today. A plan gives the customer a stock list, and they buy it as ordinary products, so those orders count under food products and packages. This view fills in once orders carry a plan."
    />
  );
}
