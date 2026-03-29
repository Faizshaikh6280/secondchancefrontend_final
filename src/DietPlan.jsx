import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Brain,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Droplets,
  Flame,
  Heart,
  Leaf,
  Sparkles,
  Drumstick,
  Wheat,
  X,
} from "lucide-react";
import useGamification from "./hooks/useGamification";
import { getDietToday, toggleMeal as apiToggleMeal } from "./api/diet.api";

const DAILY_GOALS = {
  calories: 2100,
  protein: 130,
  carbs: 210,
  fats: 65,
  fiber: 30,
  hydration: 2500,
};

const DIET_TIMELINE = [
  { id: "all", label: "All Meals" },
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "snack", label: "Snack" },
  { id: "dinner", label: "Dinner" },
];

const DIET_MEALS = [
  {
    id: "breakfast-oats",
    mealType: "breakfast",
    time: "7:30 AM",
    title: "Recovery oats bowl",
    description:
      "Slow-release breakfast to steady energy, cravings, and focus.",
    heroEmoji: "🥣",
    accent: "from-[#FFF1C7] via-white to-[#F7FBD9]",
    conditions: ["Steady energy", "Craving control", "Gut comfort"],
    nutrients: {
      calories: 430,
      protein: 28,
      carbs: 52,
      fats: 12,
      fiber: 8,
      hydration: 280,
    },
    ingredients: [
      {
        name: "Rolled oats",
        amount: "60 g",
        icon: "🌾",
        note: "Fiber helps reduce sudden hunger spikes.",
      },
      {
        name: "Greek yogurt",
        amount: "150 g",
        icon: "🥛",
        note: "Protein supports satiety and muscle repair.",
      },
      {
        name: "Banana",
        amount: "1 medium",
        icon: "🍌",
        note: "Potassium supports nerves and smooth energy.",
      },
      {
        name: "Chia seeds",
        amount: "1 tbsp",
        icon: "🫐",
        note: "Adds omega-3 fats and extra fiber.",
      },
      {
        name: "Cinnamon",
        amount: "1 tsp",
        icon: "✨",
        note: "Flavor support without extra sugar.",
      },
    ],
  },
  {
    id: "lunch-salad",
    mealType: "lunch",
    time: "1:00 PM",
    title: "Protein crunch salad",
    description: "Clean midday meal to support mood, hydration, and recovery.",
    heroEmoji: "🥗",
    accent: "from-[#FFEFCF] via-[#FFF8EA] to-white",
    conditions: ["Low inflammation", "Mental clarity", "Heart support"],
    nutrients: {
      calories: 520,
      protein: 34,
      carbs: 36,
      fats: 26,
      fiber: 7,
      hydration: 420,
    },
    ingredients: [
      {
        name: "Grilled chicken",
        amount: "120 g",
        icon: "🍗",
        note: "Lean protein for fullness and repair.",
      },
      {
        name: "Mixed greens",
        amount: "2 cups",
        icon: "🥬",
        note: "Minerals and antioxidants for healing.",
      },
      {
        name: "Cherry tomatoes",
        amount: "1 cup",
        icon: "🍅",
        note: "Adds vitamin C and hydration.",
      },
      {
        name: "Avocado",
        amount: "1/2 fruit",
        icon: "🥑",
        note: "Healthy fats help keep cravings lower.",
      },
      {
        name: "Pumpkin seeds",
        amount: "1 tbsp",
        icon: "🎃",
        note: "Magnesium supports calmer mood.",
      },
    ],
  },
  {
    id: "snack-smoothie",
    mealType: "snack",
    time: "4:30 PM",
    title: "Calm-focus smoothie",
    description:
      "Afternoon reset that protects focus when cravings usually peak.",
    heroEmoji: "🥤",
    accent: "from-[#E9F7D4] via-white to-[#FFF6DC]",
    conditions: ["Stress balance", "Hydration", "Brain fuel"],
    nutrients: {
      calories: 290,
      protein: 18,
      carbs: 28,
      fats: 11,
      fiber: 6,
      hydration: 520,
    },
    ingredients: [
      {
        name: "Spinach",
        amount: "1 cup",
        icon: "🌿",
        note: "Folate supports brain and mood health.",
      },
      {
        name: "Frozen berries",
        amount: "1 cup",
        icon: "🍓",
        note: "Antioxidants help with recovery stress.",
      },
      {
        name: "Protein milk",
        amount: "250 ml",
        icon: "🥛",
        note: "Protein keeps the snack satisfying.",
      },
      {
        name: "Peanut butter",
        amount: "1 tbsp",
        icon: "🥜",
        note: "Healthy fat slows energy crashes.",
      },
      {
        name: "Flax seeds",
        amount: "1 tsp",
        icon: "🌰",
        note: "Adds fiber and omega fats.",
      },
    ],
  },
  {
    id: "dinner-rice",
    mealType: "dinner",
    time: "8:00 PM",
    title: "Healing rice plate",
    description:
      "Comforting dinner with stable carbs and lean protein for night recovery.",
    heroEmoji: "🍛",
    accent: "from-[#FFF3D5] via-white to-[#F2F8DF]",
    conditions: ["Sleep support", "Body repair", "Late-night craving defense"],
    nutrients: {
      calories: 610,
      protein: 38,
      carbs: 62,
      fats: 16,
      fiber: 9,
      hydration: 320,
    },
    ingredients: [
      {
        name: "Brown rice",
        amount: "1 cup",
        icon: "🍚",
        note: "Complex carbs help evening stability.",
      },
      {
        name: "Salmon",
        amount: "120 g",
        icon: "🐟",
        note: "Protein and omega fats for recovery.",
      },
      {
        name: "Roasted carrots",
        amount: "1 cup",
        icon: "🥕",
        note: "Beta-carotene supports healing.",
      },
      {
        name: "Broccoli",
        amount: "1 cup",
        icon: "🥦",
        note: "Fiber and micronutrients for fullness.",
      },
      {
        name: "Olive oil",
        amount: "1 tsp",
        icon: "🫒",
        note: "Adds heart-friendly fats.",
      },
    ],
  },
];

const NUTRIENT_CONFIG = [
  {
    key: "calories",
    label: "Calories",
    shortLabel: "Energy",
    unit: "kcal",
    icon: Flame,
    color: "#F97316",
    soft: "bg-orange-50",
  },
  {
    key: "protein",
    label: "Protein",
    shortLabel: "Protein",
    unit: "g",
    icon: Drumstick,
    color: "#7D9C6D",
    soft: "bg-[#EEF6DA]",
  },
  {
    key: "carbs",
    label: "Carbs",
    shortLabel: "Carbs",
    unit: "g",
    icon: Wheat,
    color: "#EAB308",
    soft: "bg-yellow-50",
  },
  {
    key: "fats",
    label: "Fats",
    shortLabel: "Fats",
    unit: "g",
    icon: Activity,
    color: "#EC4899",
    soft: "bg-pink-50",
  },
  {
    key: "fiber",
    label: "Fiber",
    shortLabel: "Fiber",
    unit: "g",
    icon: Leaf,
    color: "#22C55E",
    soft: "bg-green-50",
  },
  {
    key: "hydration",
    label: "Hydration",
    shortLabel: "Water",
    unit: "ml",
    icon: Droplets,
    color: "#38BDF8",
    soft: "bg-sky-50",
  },
];

const plateItems = ["🥬", "🍤", "🥕", "🌽", "🍅"];
const MotionDiv = motion.div;

function NutritionPlate() {
  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_16px_35px_rgba(0,0,0,0.1)]">
      <div className="absolute inset-3 rounded-full border border-[#F4E3BD]" />
      {plateItems.map((item, index) => {
        const positions = [
          "top-3 left-5",
          "top-5 right-2",
          "bottom-5 left-3",
          "bottom-4 right-5",
          "top-10 left-1/2 -translate-x-1/2",
        ];

        return (
          <span
            key={item + index}
            className={`absolute text-xl ${positions[index]}`}
          >
            {item}
          </span>
        );
      })}
      <div className="absolute bottom-2 left-1/2 h-2 w-14 -translate-x-1/2 rounded-full bg-black/5 blur-sm" />
    </div>
  );
}

function DietIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3c0 4.5 2 7 6 7" />
      <path d="M18 3c0 4.5-2 7-6 7" />
      <path d="M12 10v11" />
      <path d="M8 21h8" />
      <path d="M6.5 6.5C8 5 10 4 12 4s4 .9 5.5 2.5" />
    </svg>
  );
}

export default function DietPlan({ onBack }) {
  const { awardProgress, refreshFromGamification } = useGamification();
  const [selectedTimeline, setSelectedTimeline] = useState("all");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [completedMeals, setCompletedMeals] = useState([]);
  const [meals, setMeals] = useState(DIET_MEALS);
  const [dailyGoals, setDailyGoals] = useState(DAILY_GOALS);

  useEffect(() => {
    getDietToday().then(res => {
      const data = res.data;
      if (data.meals?.length) {
        const mapped = data.meals.map(m => ({
          id: m.mealId || m._id || m.id,
          mealType: m.mealType,
          time: m.time,
          title: m.title,
          description: m.description || '',
          heroEmoji: m.heroEmoji || '🍽️',
          accent: m.mealType === 'breakfast' ? 'from-[#FFF1C7] via-white to-[#F7FBD9]' :
                  m.mealType === 'lunch' ? 'from-[#FFEFCF] via-[#FFF8EA] to-white' :
                  m.mealType === 'snack' ? 'from-[#E9F7D4] via-white to-[#FFF6DC]' :
                  'from-[#FFF3D5] via-white to-[#F2F8DF]',
          conditions: m.conditions || [],
          nutrients: m.nutrients || { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, hydration: 0 },
          ingredients: m.ingredients || [],
        }));
        setMeals(mapped);
        const done = data.meals.filter(m => m.completed).map(m => m.mealId || m._id || m.id);
        if (done.length) setCompletedMeals(done);
      }
      if (data.dailyGoals) setDailyGoals(data.dailyGoals);
    }).catch(() => {});
  }, []);

  const filteredMeals =
    selectedTimeline === "all"
      ? meals
      : meals.filter((meal) => meal.mealType === selectedTimeline);

  const completedMealSet = new Set(completedMeals);

  const totals = meals.reduce(
    (accumulator, meal) => {
      if (!completedMealSet.has(meal.id)) {
        return accumulator;
      }

      return {
        calories: accumulator.calories + meal.nutrients.calories,
        protein: accumulator.protein + meal.nutrients.protein,
        carbs: accumulator.carbs + meal.nutrients.carbs,
        fats: accumulator.fats + meal.nutrients.fats,
        fiber: accumulator.fiber + meal.nutrients.fiber,
        hydration: accumulator.hydration + meal.nutrients.hydration,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, hydration: 0 },
  );

  const nutrientCards = NUTRIENT_CONFIG.map((item) => {
    const value = totals[item.key];
    const goal = dailyGoals[item.key];
    const progress = Math.min(Math.round((value / goal) * 100), 100);

    return {
      ...item,
      value,
      goal,
      progress,
    };
  });

  const totalProgress = Math.round(
    nutrientCards.reduce((sum, item) => sum + item.progress, 0) /
      nutrientCards.length,
  );

  const toggleMealCompletion = (mealId) => {
    const isCompleting = !completedMeals.includes(mealId);

    setCompletedMeals((previous) =>
      previous.includes(mealId)
        ? previous.filter((id) => id !== mealId)
        : [...previous, mealId],
    );

    if (isCompleting) {
      awardProgress({
        actionKey: `diet-meal-${mealId}`,
        xp: 90,
        gems: 6,
        updates: { dietPlansFollowed: 1 },
      });
    }

    apiToggleMeal(mealId).then(res => {
      if (res.data?.gamification) refreshFromGamification(res.data.gamification);
    }).catch(() => {});
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="flex h-full flex-1 flex-col overflow-hidden bg-[#FAFAFA] font-sans"
    >
      {/* SHORTER UPPER HEADER SECTION */}
      <div className="rounded-b-[32px] bg-white px-6 pb-5 pt-8 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-700 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="rounded-full bg-[#EEF6DA] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-[#7D9C6D]">
            Diet Route
          </div>
        </div>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FFE9B5] via-[#FFF7E3] to-white p-4 shadow-[0_12px_30px_rgba(243,211,128,0.2)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-[60%]">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7D9C6D]">
                Today&apos;s Nutrition
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-[1.1] text-gray-800">
                Complete your daily fuel
              </h1>
              <p className="mt-2 text-[13px] font-medium leading-snug text-gray-600">
                Meals designed to support energy, healing, and craving control.
              </p>
            </div>

            <NutritionPlate />
          </div>

          <div className="mt-3 flex items-center justify-between rounded-[22px] bg-white/80 px-4 py-3 backdrop-blur">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Meals Completed
              </p>
              <p className="mt-0.5 text-xl font-bold text-gray-800">
                {completedMeals.length}
                <span className="text-sm text-gray-400">
                  {" "}
                  / {DIET_MEALS.length}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF6DA] text-[#7D9C6D]">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  Progress
                </p>
                <p className="text-base font-bold text-[#7D9C6D]">
                  {totalProgress}%
                </p>
              </div>
            </div>
          </div>
        </MotionDiv>
      </div>

      <div className="hide-scrollbar flex-1 overflow-y-auto px-6 pb-32 pt-6">
        {/* HORIZONTAL SCROLLING NUTRIENT SUMMARY */}
        <div className="-mr-6 mb-8 overflow-x-auto pb-2 pr-6 hide-scrollbar">
          <div className="flex min-w-max gap-3">
            {nutrientCards.map((item, index) => (
              <MotionDiv
                key={item.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="min-w-[150px] rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.soft}`}
                    style={{ color: item.color }}
                  >
                    <item.icon size={20} />
                  </div>
                  <span className="rounded-full bg-gray-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                    {item.progress}%
                  </span>
                </div>

                <h2 className="mt-3 text-[13px] font-semibold text-gray-500">
                  {item.label}
                </h2>
                <p className="mt-0.5 text-xl font-bold text-gray-800">
                  {item.value}
                  <span className="ml-1 text-xs font-semibold text-gray-400">
                    {item.unit}
                  </span>
                </p>
                <p className="mt-1 text-[11px] font-medium text-gray-500">
                  Goal {item.goal} {item.unit}
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <MotionDiv
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 0.7, delay: index * 0.05 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>

        {/* HORIZONTAL SCROLLING MEAL TABS */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {DIET_TIMELINE.map((item) => {
            const isActive = item.id === selectedTimeline;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedTimeline(item.id)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-[13px] font-bold transition-all ${
                  isActive
                    ? "border-transparent bg-gray-900 text-white shadow-md"
                    : "border-gray-200 bg-white text-gray-500 hover:border-[#D9ECA2] hover:text-[#7D9C6D]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Diet Timeline
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-800">
              Meals for today
            </h2>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-[#EEF6DA] px-3 py-1.5 text-[11px] font-bold text-[#7D9C6D]">
            <Heart size={12} fill="currentColor" />
            Built for recovery
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredMeals.map((meal, index) => {
              const isCompleted = completedMealSet.has(meal.id);

              return (
                <MotionDiv
                  layout
                  key={meal.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 18 }}
                  transition={{ delay: index * 0.05 }}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedMeal(meal)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedMeal(meal);
                    }
                  }}
                  className="w-full overflow-hidden rounded-[28px] border border-gray-100 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br text-3xl ${meal.accent}`}
                    >
                      {meal.heroEmoji}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                            <Clock3 size={12} />
                            {meal.time}
                          </div>
                          <h3 className="mt-1 text-lg font-black text-gray-800">
                            {meal.title}
                          </h3>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                            isCompleted
                              ? "bg-[#EEF6DA] text-[#7D9C6D]"
                              : "bg-orange-50 text-orange-500"
                          }`}
                        >
                          {isCompleted ? "Done" : "Open"}
                        </span>
                      </div>

                      <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">
                        {meal.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {meal.conditions.map((condition) => (
                      <span
                        key={condition}
                        className="rounded-full bg-[#F8FBEF] px-2.5 py-1 text-[11px] font-bold text-[#7D9C6D]"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>

                  {/* HORIZONTAL SCROLLING MEAL NUTRIENTS */}
                  <div className="-mx-2 mt-4 overflow-x-auto px-2 hide-scrollbar">
                    <div className="flex gap-2 rounded-[20px] bg-[#FAFAFA] p-3 w-max">
                      {NUTRIENT_CONFIG.map((item) => (
                        <div key={item.key} className="min-w-[60px] pr-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                            {item.shortLabel}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-gray-800">
                            {meal.nutrients[item.key]}
                            <span className="ml-0.5 text-[10px] font-semibold text-gray-400">
                              {item.unit}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <Leaf size={14} className="text-[#7D9C6D]" />
                      View details
                    </div>

                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleMealCompletion(meal.id);
                      }}
                      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
                        isCompleted
                          ? "bg-[#7D9C6D] text-white shadow-md"
                          : "bg-gray-900 text-white hover:bg-black"
                      }`}
                    >
                      {isCompleted ? "Undo" : "Complete"}
                    </button>
                  </div>
                </MotionDiv>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* SELECTED MEAL MODAL */}
      <AnimatePresence>
        {selectedMeal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMeal(null)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            />

            <MotionDiv
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="relative z-10 flex max-h-[88vh] w-full max-w-[390px] flex-col overflow-hidden rounded-t-[40px] bg-white shadow-2xl sm:rounded-[40px]"
            >
              <div
                className={`relative overflow-hidden bg-gradient-to-br ${selectedMeal.accent} px-6 pb-6 pt-10`}
              >
                <button
                  onClick={() => setSelectedMeal(null)}
                  className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-sm backdrop-blur"
                >
                  <X size={18} />
                </button>

                <div className="flex items-start justify-between gap-4">
                  <div className="max-w-[60%]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7D9C6D]">
                      {selectedMeal.time}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold leading-tight text-gray-800">
                      {selectedMeal.title}
                    </h2>
                    <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-600">
                      {selectedMeal.description}
                    </p>
                  </div>

                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-5xl shadow-[0_14px_30px_rgba(0,0,0,0.1)]">
                    {selectedMeal.heroEmoji}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  {NUTRIENT_CONFIG.map((item) => (
                    <div
                      key={item.key}
                      className="rounded-[20px] bg-white/80 p-3 backdrop-blur"
                    >
                      <div
                        className="flex items-center gap-1.5"
                        style={{ color: item.color }}
                      >
                        <item.icon size={14} />
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
                          {item.shortLabel}
                        </p>
                      </div>
                      <p className="mt-1.5 text-lg font-bold text-gray-800">
                        {selectedMeal.nutrients[item.key]}
                        <span className="ml-1 text-[11px] font-semibold text-gray-400">
                          {item.unit}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hide-scrollbar flex-1 overflow-y-auto px-6 pb-8 pt-6">
                <div className="mb-5 flex flex-wrap gap-2">
                  {selectedMeal.conditions.map((condition) => (
                    <span
                      key={condition}
                      className="rounded-full bg-[#F8FBEF] px-3 py-1.5 text-[11px] font-bold text-[#7D9C6D]"
                    >
                      {condition}
                    </span>
                  ))}
                </div>

                <div className="mb-6 rounded-[28px] border border-gray-100 bg-[#FAFAFA] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        Ingredients
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-gray-800">
                        {selectedMeal.ingredients.length} raw ingredients
                      </h3>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#7D9C6D] shadow-sm">
                      <DietIcon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {selectedMeal.ingredients.map((ingredient) => (
                      <div
                        key={ingredient.name}
                        className="flex items-start gap-3 rounded-[20px] bg-white p-3.5 shadow-sm"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] bg-[#FFF7E3] text-xl">
                          {ingredient.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13px] font-semibold text-gray-800">
                              {ingredient.name}
                            </p>
                            <span className="rounded-full bg-gray-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                              {ingredient.amount}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-medium leading-relaxed text-gray-500">
                            {ingredient.note}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    toggleMealCompletion(selectedMeal.id);
                    setSelectedMeal(null);
                  }}
                  className={`flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-[24px] py-4 text-base font-bold transition-all ${
                    completedMealSet.has(selectedMeal.id)
                      ? "bg-[#EEF6DA] text-[#7D9C6D]"
                      : "bg-[#7D9C6D] text-white shadow-[0_10px_24px_rgba(125,156,109,0.34)]"
                  }`}
                >
                  <CheckCircle2 size={20} />
                  {completedMealSet.has(selectedMeal.id)
                    ? "Remove from today"
                    : "Mark meal as completed"}
                </button>
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </MotionDiv>
  );
}
