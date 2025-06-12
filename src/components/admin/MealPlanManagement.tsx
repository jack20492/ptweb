import React, { useState } from "react";
import { useData } from "../../contexts/DataContext";
import {
  Plus,
  Edit,
  Trash2,
  User,
  Utensils,
  Search,
  X,
  ChefHat,
  Copy,
} from "lucide-react";

const MealPlanManagement: React.FC = () => {
  const { mealPlans, addMealPlan, updateMealPlan, deleteMealPlan } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState("");
  const [planName, setPlanName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [meals, setMeals] = useState([
    {
      name: "Bữa sáng",
      totalCalories: 0,
      foods: [
        {
          name: "",
          macroType: "Carb",
          calories: 0,
          notes: "",
        },
      ],
    },
    {
      name: "Bữa trưa",
      totalCalories: 0,
      foods: [
        {
          name: "",
          macroType: "Pro",
          calories: 0,
          notes: "",
        },
      ],
    },
    {
      name: "Bữa tối",
      totalCalories: 0,
      foods: [
        {
          name: "",
          macroType: "Pro",
          calories: 0,
          notes: "",
        },
      ],
    },
  ]);
  const [notes, setNotes] = useState("");

  // Duplicate meal plan state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [planToDuplicate, setPlanToDuplicate] = useState<any>(null);
  const [duplicateClientId, setDuplicateClientId] = useState("");

  // Delete confirm popup state
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<any>(null);

  const clients = JSON.parse(localStorage.getItem("pt_users") || "[]").filter(
    (u: any) => u.role === "client"
  );

  const filteredPlans = mealPlans.filter((plan) => {
    const client = clients.find((c: any) => c.id === plan.clientId);
    const clientName = client?.fullName || "";
    return clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalCalories = meals.reduce(
      (sum, meal) => sum + meal.totalCalories,
      0
    );

    const planData = {
      id: editingPlan?.id || `meal-plan-${Date.now()}`,
      name: planName || "Chế độ dinh dưỡng",
      clientId: selectedClient,
      meals: meals.filter((meal) =>
        meal.foods.some((food) => food.name.trim())
      ),
      totalCalories,
      notes,
    };

    if (editingPlan) {
      updateMealPlan(editingPlan.id, planData);
    } else {
      addMealPlan(planData);
    }
    resetForm();
  };

  const resetForm = () => {
    setSelectedClient("");
    setPlanName("");
    setMeals([
      {
        name: "Bữa sáng",
        totalCalories: 0,
        foods: [
          {
            name: "",
            macroType: "Carb",
            calories: 0,
            notes: "",
          },
        ],
      },
      {
        name: "Bữa trưa",
        totalCalories: 0,
        foods: [
          {
            name: "",
            macroType: "Pro",
            calories: 0,
            notes: "",
          },
        ],
      },
      {
        name: "Bữa tối",
        totalCalories: 0,
        foods: [
          {
            name: "",
            macroType: "Pro",
            calories: 0,
            notes: "",
          },
        ],
      },
    ]);
    setNotes("");
    setEditingPlan(null);
    setShowForm(false);
  };

  const updateMeal = (mealIndex: number, field: string, value: any) => {
    const newMeals = [...meals];
    newMeals[mealIndex][field] = value;
    setMeals(newMeals);
  };

  const addFood = (mealIndex: number) => {
    const newMeals = [...meals];
    newMeals[mealIndex].foods.push({
      name: "",
      macroType: "Carb",
      calories: 0,
      notes: "",
    });
    newMeals[mealIndex].totalCalories = newMeals[mealIndex].foods.reduce(
      (sum, food) => sum + (food.calories || 0),
      0
    );
    setMeals(newMeals);
  };

  const removeFood = (mealIndex: number, foodIndex: number) => {
    const newMeals = [...meals];
    newMeals[mealIndex].foods.splice(foodIndex, 1);
    newMeals[mealIndex].totalCalories = newMeals[mealIndex].foods.reduce(
      (sum, food) => sum + (food.calories || 0),
      0
    );
    setMeals(newMeals);
  };

  const updateFood = (
    mealIndex: number,
    foodIndex: number,
    field: string,
    value: any
  ) => {
    const newMeals = [...meals];
    newMeals[mealIndex].foods[foodIndex][field] = value;
    newMeals[mealIndex].totalCalories = newMeals[mealIndex].foods.reduce(
      (sum, food) => sum + (food.calories || 0),
      0
    );
    setMeals(newMeals);
  };

  const addMeal = () => {
    setMeals([
      ...meals,
      {
        name: "",
        totalCalories: 0,
        foods: [
          {
            name: "",
            macroType: "Carb",
            calories: 0,
            notes: "",
          },
        ],
      },
    ]);
  };

  const removeMeal = (mealIndex: number) => {
    if (meals.length > 1) {
      const newMeals = meals.filter((_, index) => index !== mealIndex);
      setMeals(newMeals);
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setSelectedClient(plan.clientId);
    setPlanName(plan.name || "");
    setMeals(plan.meals);
    setNotes(plan.notes || "");
    setShowForm(true);
  };

  // Duplicate logic
  const handleDuplicate = (plan: any) => {
    setPlanToDuplicate(plan);
    setDuplicateClientId("");
    setShowDuplicateModal(true);
  };

  const confirmDuplicate = () => {
    if (!planToDuplicate || !duplicateClientId) return;
    // Deep clone meals
    const clonedMeals = planToDuplicate.meals.map((meal: any) => ({
      ...meal,
      foods: meal.foods.map((food: any) => ({ ...food })),
    }));
    const totalCalories = clonedMeals.reduce(
      (sum: number, meal: any) => sum + (meal.totalCalories || 0),
      0
    );
    const newPlan = {
      ...planToDuplicate,
      id: `meal-plan-${Date.now()}`,
      clientId: duplicateClientId,
      meals: clonedMeals,
      totalCalories,
      name: planToDuplicate.name + " (Copy)",
    };
    addMealPlan(newPlan);
    setShowDuplicateModal(false);
    setPlanToDuplicate(null);
    setDuplicateClientId("");
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c: any) => c.id === clientId);
    return client?.fullName || "Không tìm thấy";
  };

  const getMacroColor = (macroType: string) => {
    switch (macroType) {
      case "Carb":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pro":
        return "bg-green-100 text-green-800 border-green-200";
      case "Fat":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Delete popup logic
  const openDeletePopup = (plan: any) => {
    setPlanToDelete(plan);
    setShowDeletePopup(true);
  };
  const handleConfirmDelete = () => {
    if (planToDelete) {
      deleteMealPlan(planToDelete.id);
    }
    setShowDeletePopup(false);
    setPlanToDelete(null);
  };
  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setPlanToDelete(null);
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 space-y-3 lg:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-fitness-black">
            🍽️ Quản lý chế độ dinh dưỡng
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
            Tạo và quản lý meal plan chi tiết cho học viên
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-fitness-red to-red-600 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-xs sm:text-sm lg:text-base"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
          <span className="font-medium">Tạo meal plan</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên học viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 lg:pl-12 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200 text-xs sm:text-sm lg:text-base"
          />
        </div>
      </div>

      {/* Meal Plans List */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4 lg:mb-6 space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-fitness-black mb-2">
                    🍽️ {plan.name} - {getClientName(plan.clientId)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{getClientName(plan.clientId)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Utensils className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{plan.meals.length} bữa ăn</span>
                    </span>
                    <span className="bg-fitness-red text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                      {plan.totalCalories} kcal/ngày
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 sm:p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  </button>
                  <button
                    onClick={() => openDeletePopup(plan)}
                    className="p-2 sm:p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(plan)}
                    className="p-2 sm:p-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-110"
                    title="Duplicate meal plan"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {plan.meals.map((meal, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 sm:p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-fitness-black text-xs sm:text-sm lg:text-base">
                        {meal.name}
                      </h4>
                      <span className="bg-fitness-red text-white px-2 py-1 rounded-full text-xs font-medium">
                        {meal.totalCalories} kcal
                      </span>
                    </div>

                    <div className="space-y-2">
                      {meal.foods.map((food, foodIndex) => (
                        <div
                          key={foodIndex}
                          className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-800 text-xs sm:text-sm">
                              {food.name}
                            </h5>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getMacroColor(
                                food.macroType
                              )}`}
                            >
                              {food.macroType}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{food.calories} kcal</span>
                            {food.notes && (
                              <span className="italic">"{food.notes}"</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {plan.notes && (
                <div className="mt-3 sm:mt-4 lg:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 text-xs sm:text-sm lg:text-base">
                    📝 Ghi chú:
                  </h4>
                  <p className="text-blue-800 text-xs sm:text-sm">
                    {plan.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-12 text-center">
          <ChefHat className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-500 mb-2">
            Chưa có meal plan nào
          </h3>
          <p className="text-xs sm:text-sm lg:text-base text-gray-400">
            Tạo meal plan đầu tiên cho học viên
          </p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-fitness-black">
                  {editingPlan
                    ? "✏️ Chỉnh sửa meal plan"
                    : "🍽️ Tạo meal plan mới"}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-6 lg:p-8">
              <form
                onSubmit={handleSubmit}
                className="space-y-4 sm:space-y-6 lg:space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Tên meal plan
                    </label>
                    <input
                      type="text"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200 text-xs sm:text-sm lg:text-base"
                      placeholder="VD: Chế độ giảm cân, tăng cơ..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Chọn học viên
                    </label>
                    <select
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200 text-xs sm:text-sm lg:text-base"
                      required
                    >
                      <option value="">Chọn học viên</option>
                      {clients.map((client: any) => (
                        <option key={client.id} value={client.id}>
                          {client.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-fitness-black">
                      🍽️ Các bữa ăn
                    </h4>
                    <button
                      type="button"
                      onClick={addMeal}
                      className="text-xs sm:text-sm bg-green-500 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Thêm bữa ăn
                    </button>
                  </div>

                  {meals.map((meal, mealIndex) => (
                    <div
                      key={mealIndex}
                      className="border border-gray-200 rounded-xl p-3 sm:p-4 lg:p-6 bg-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                        <input
                          type="text"
                          value={meal.name}
                          onChange={(e) =>
                            updateMeal(mealIndex, "name", e.target.value)
                          }
                          className="text-sm sm:text-base lg:text-lg font-semibold bg-transparent border-none outline-none focus:bg-white focus:border focus:border-gray-300 rounded px-2 sm:px-3 py-1 sm:py-2 flex-1"
                          placeholder="Tên bữa ăn"
                          required
                        />
                        <div className="flex items-center space-x-2">
                          <span className="bg-fitness-red text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                            {meal.totalCalories} kcal
                          </span>
                          {meals.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMeal(mealIndex)}
                              className="text-red-500 hover:bg-red-100 p-1 sm:p-2 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700">
                            🥘 Thực phẩm
                          </label>
                          <button
                            type="button"
                            onClick={() => addFood(mealIndex)}
                            className="text-xs sm:text-sm bg-blue-500 text-white px-2 sm:px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            Thêm món
                          </button>
                        </div>
                        <div className="space-y-3">
                          {meal.foods.map((food, foodIndex) => (
                            <div
                              key={foodIndex}
                              className="bg-white rounded-lg p-2 sm:p-3 lg:p-4 border border-gray-200"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <input
                                  type="text"
                                  value={food.name}
                                  onChange={(e) =>
                                    updateFood(
                                      mealIndex,
                                      foodIndex,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent text-xs sm:text-sm"
                                  placeholder="Tên món ăn"
                                  required
                                />
                                <select
                                  value={food.macroType}
                                  onChange={(e) =>
                                    updateFood(
                                      mealIndex,
                                      foodIndex,
                                      "macroType",
                                      e.target.value
                                    )
                                  }
                                  className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent text-xs sm:text-sm"
                                >
                                  <option value="Carb">🍞 Carb</option>
                                  <option value="Pro">🥩 Pro</option>
                                  <option value="Fat">🥑 Fat</option>
                                </select>
                                <input
                                  type="number"
                                  min="0"
                                  value={food.calories}
                                  onChange={(e) =>
                                    updateFood(
                                      mealIndex,
                                      foodIndex,
                                      "calories",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent text-xs sm:text-sm"
                                  placeholder="Calo"
                                  required
                                />
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={food.notes}
                                    onChange={(e) =>
                                      updateFood(
                                        mealIndex,
                                        foodIndex,
                                        "notes",
                                        e.target.value
                                      )
                                    }
                                    className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent text-xs sm:text-sm"
                                    placeholder="Ghi chú"
                                  />
                                  {meal.foods.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeFood(mealIndex, foodIndex)
                                      }
                                      className="text-red-500 hover:bg-red-100 p-1 sm:p-2 rounded transition-colors"
                                    >
                                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total calories display */}
                <div className="bg-gradient-to-r from-fitness-red to-red-600 bg-opacity-10 rounded-xl p-3 sm:p-4 lg:p-6 border border-fitness-red border-opacity-20">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-fitness-black text-sm sm:text-base lg:text-lg">
                      📊 Tổng calories trong ngày:
                    </span>
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-fitness-red">
                      {meals.reduce((sum, meal) => sum + meal.totalCalories, 0)}{" "}
                      kcal
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    📝 Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200 text-xs sm:text-sm lg:text-base"
                    placeholder="Ghi chú về chế độ dinh dưỡng, lưu ý đặc biệt..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-xs sm:text-sm lg:text-base"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-fitness-red to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium text-xs sm:text-sm lg:text-base"
                  >
                    {editingPlan ? "Cập nhật" : "Tạo meal plan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {showDuplicateModal && planToDuplicate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-fitness-black">
                Duplicate meal plan
              </h3>
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Chọn học viên để gán meal plan này:
              </label>
              <select
                value={duplicateClientId}
                onChange={(e) => setDuplicateClientId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200 mb-4"
              >
                <option value="">-- Chọn học viên --</option>
                {clients.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName}
                  </option>
                ))}
              </select>
              <button
                onClick={confirmDuplicate}
                disabled={!duplicateClientId}
                className="w-full px-6 py-3 bg-gradient-to-r from-fitness-red to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
              >
                Xác nhận Duplicate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Popup */}
      {showDeletePopup && planToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 text-red-600 rounded-full p-4 mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Xóa meal plan?
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa meal plan{" "}
                <span className="font-semibold">{planToDelete.name}</span>?
                <br />
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex w-full gap-4">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-fitness-red to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanManagement;
