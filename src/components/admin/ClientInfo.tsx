import React, { useState } from "react";
import { useData } from "../../contexts/DataContext";
import {
  User,
  Dumbbell,
  Utensils,
  Trash2,
  Search,
  Calendar,
  Target,
  Eye,
  X,
  Scale,
} from "lucide-react";

const ClientInfo: React.FC = () => {
  const {
    workoutPlans,
    mealPlans,
    weightRecords,
    deleteWorkoutPlan,
    deleteMealPlan,
  } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [showPlanDetailModal, setShowPlanDetailModal] = useState(false);
  const [planDetail, setPlanDetail] = useState<any>(null);
  const [showMealDetailModal, setShowMealDetailModal] = useState(false);
  const [mealDetail, setMealDetail] = useState<any>(null);

  // Popup xác nhận xóa workout plan
  const [showDeleteWorkoutPopup, setShowDeleteWorkoutPopup] = useState(false);
  const [workoutPlanToDelete, setWorkoutPlanToDelete] = useState<any>(null);

  // Popup xác nhận xóa meal plan
  const [showDeleteMealPopup, setShowDeleteMealPopup] = useState(false);
  const [mealPlanToDelete, setMealPlanToDelete] = useState<any>(null);

  const clients = JSON.parse(localStorage.getItem("pt_users") || "[]").filter(
    (u: any) => u.role === "client"
  );

  const filteredClients = clients.filter(
    (client: any) =>
      client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientWorkoutPlans = (clientId: string) => {
    return workoutPlans.filter((plan) => plan.clientId === clientId);
  };

  const getClientMealPlans = (clientId: string) => {
    return mealPlans.filter((plan) => plan.clientId === clientId);
  };

  const openPlanDetail = (plan: any) => {
    setPlanDetail(plan);
    setShowPlanDetailModal(true);
  };

  const openMealDetail = (plan: any) => {
    setMealDetail(plan);
    setShowMealDetailModal(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-fitness-black mb-2">
          👥 Thông tin học viên
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Xem và quản lý thông tin chi tiết của từng học viên
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          <input
            type="text"
            placeholder="Tìm kiếm học viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-4 sm:space-y-6">
        {filteredClients.map((client: any) => {
          const clientWorkouts = getClientWorkoutPlans(client.id);
          const clientMeals = getClientMealPlans(client.id);
          // --- Weight chart data for this client ---
          const clientWeights = weightRecords
            .filter((r) => r.clientId === client.id)
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );
          const chartData = clientWeights.slice(-10);
          const maxWeight = Math.max(...chartData.map((r) => r.weight), 0);
          const minWeight = Math.min(
            ...chartData.map((r) => r.weight),
            maxWeight || 1
          );
          const weightRange = maxWeight - minWeight || 1;

          return (
            <div
              key={client.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-4 sm:p-6 lg:p-8">
                {/* Client Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    {client.avatar ? (
                      <img
                        src={client.avatar}
                        alt={client.fullName}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-fitness-red to-red-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-fitness-black">
                        {client.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        @{client.username}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                        <span>{client.email}</span>
                        {client.phone && <span>{client.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      {clientWorkouts.length} bài tập
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      {clientMeals.length} meal plan
                    </span>
                  </div>
                </div>

                {/* Weight Chart */}
                {chartData.length > 1 && (
                  <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <Scale className="h-5 w-5 mr-2 text-fitness-red" />
                      <span className="font-semibold text-fitness-black">
                        Biểu đồ cân nặng
                      </span>
                    </div>
                    <svg className="w-full h-32" viewBox="0 0 400 130">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <line
                          key={i}
                          x1="40"
                          y1={20 + i * 22}
                          x2="380"
                          y2={20 + i * 22}
                          stroke="#f3f4f6"
                          strokeWidth="1"
                        />
                      ))}
                      <polyline
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="3"
                        points={chartData
                          .map((record, index) => {
                            const x =
                              40 + (index * 340) / (chartData.length - 1);
                            const y =
                              20 +
                              ((maxWeight - record.weight) / weightRange) * 88;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />
                      {chartData.map((record, index) => {
                        const x = 40 + (index * 340) / (chartData.length - 1);
                        const y =
                          20 + ((maxWeight - record.weight) / weightRange) * 88;
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#DC2626"
                          />
                        );
                      })}
                      {[0, 1, 2, 3, 4].map((i) => {
                        const weight = maxWeight - (i * weightRange) / 4;
                        return (
                          <text
                            key={i}
                            x="35"
                            y={24 + i * 22}
                            textAnchor="end"
                            fontSize="10"
                            fill="#6b7280"
                          >
                            {weight.toFixed(1)}
                          </text>
                        );
                      })}
                      {chartData.map((record, index) => {
                        if (index % Math.ceil(chartData.length / 5) === 0) {
                          const x = 40 + (index * 340) / (chartData.length - 1);
                          return (
                            <text
                              key={index}
                              x={x}
                              y="120"
                              textAnchor="middle"
                              fontSize="10"
                              fill="#6b7280"
                            >
                              {new Date(record.date).toLocaleDateString(
                                "vi-VN",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </text>
                          );
                        }
                        return null;
                      })}
                    </svg>
                  </div>
                )}

                {/* Workout Plans */}
                {clientWorkouts.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-base sm:text-lg font-semibold text-fitness-black mb-4 flex items-center">
                      <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Bài tập được giao
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {clientWorkouts.map((plan) => (
                        <div
                          key={plan.id}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold text-blue-900 text-sm sm:text-base">
                              {plan.name}
                            </h5>
                            <div className="flex gap-1">
                              <button
                                onClick={() => openPlanDetail(plan)}
                                title="Xem chi tiết tuần"
                                className="text-green-500 hover:bg-green-100 p-1 sm:p-2 rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setWorkoutPlanToDelete(plan);
                                  setShowDeleteWorkoutPopup(true);
                                }}
                                className="text-red-500 hover:bg-red-100 p-1 sm:p-2 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm text-blue-800">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Tuần {plan.weekNumber}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4" />
                              <span>
                                {plan.days.filter((d) => !d.isRestDay).length}{" "}
                                ngày tập
                              </span>
                            </div>
                            <div className="text-xs text-blue-600">
                              Bắt đầu:{" "}
                              {new Date(plan.startDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meal Plans */}
                {clientMeals.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-base sm:text-lg font-semibold text-fitness-black mb-4 flex items-center">
                      <Utensils className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Chế độ dinh dưỡng
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {clientMeals.map((plan) => (
                        <div
                          key={plan.id}
                          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold text-green-900 text-sm sm:text-base">
                              Meal Plan
                            </h5>
                            <div className="flex gap-1">
                              <button
                                onClick={() => openMealDetail(plan)}
                                title="Xem chi tiết meal plan"
                                className="text-blue-500 hover:bg-blue-100 p-1 sm:p-2 rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setMealPlanToDelete(plan);
                                  setShowDeleteMealPopup(true);
                                }}
                                className="text-red-500 hover:bg-red-100 p-1 sm:p-2 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm text-green-800">
                            <div className="flex items-center justify-between">
                              <span>{plan.meals.length} bữa ăn</span>
                              <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                {plan.totalCalories} kcal
                              </span>
                            </div>
                            {plan.notes && (
                              <div className="text-xs text-green-600 italic">
                                "{plan.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No data message */}
                {clientWorkouts.length === 0 && clientMeals.length === 0 && (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <div className="text-3xl sm:text-4xl mb-3">📋</div>
                    <p className="text-sm sm:text-base">
                      Học viên chưa được giao bài tập hoặc meal plan nào
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal xem chi tiết workout plan */}
      {showPlanDetailModal && planDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-xl font-bold text-fitness-black">
                {planDetail.name} (Tuần {planDetail.weekNumber})
              </h3>
              <button
                onClick={() => setShowPlanDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="space-y-6">
              {planDetail.days.map((day, dayIdx) => (
                <div key={dayIdx} className="mb-6">
                  <div className="font-semibold text-lg mb-2">
                    📅 {day.day} {day.isRestDay ? "(Nghỉ)" : ""}
                  </div>
                  {!day.isRestDay ? (
                    <div className="space-y-4">
                      {day.exercises.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="border rounded-lg p-3 bg-gray-50"
                        >
                          <div className="font-medium mb-2">💪 {ex.name}</div>
                          <table className="w-full text-xs mb-2">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-1">Set</th>
                                <th className="text-center py-1">Reps</th>
                                <th className="text-center py-1">Reality</th>
                                <th className="text-center py-1">Weight</th>
                                <th className="text-center py-1">Volume</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ex.sets.map((set, setIdx) => (
                                <tr key={setIdx} className="border-b">
                                  <td>Set {set.set}</td>
                                  <td className="text-center">{set.reps}</td>
                                  <td className="text-center">
                                    {set.reality ?? set.reps}
                                  </td>
                                  <td className="text-center">
                                    {set.weight ?? 0} kg
                                  </td>
                                  <td className="text-center">
                                    {set.volume ??
                                      (set.reality ?? set.reps) *
                                        (set.weight ?? 0)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">Ngày nghỉ</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết meal plan */}
      {showMealDetailModal && mealDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-xl font-bold text-fitness-black">
                {mealDetail.name} ({mealDetail.meals.length} bữa ăn) -{" "}
                {mealDetail.totalCalories} kcal
              </h3>
              <button
                onClick={() => setShowMealDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="space-y-6">
              {mealDetail.meals.map((meal: any, idx: number) => (
                <div
                  key={idx}
                  className="mb-6 border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-base">
                      🍽️ {meal.name}
                    </div>
                    <span className="bg-fitness-red text-white px-2 py-1 rounded-full text-xs font-medium">
                      {meal.totalCalories} kcal
                    </span>
                  </div>
                  <div className="space-y-2">
                    {meal.foods.map((food: any, foodIdx: number) => (
                      <div
                        key={foodIdx}
                        className="flex items-center justify-between border-b py-2"
                      >
                        <div>
                          <span className="font-medium">{food.name}</span>
                          {food.notes && (
                            <span className="ml-2 text-xs italic text-gray-500">
                              "{food.notes}"
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 rounded-full">
                            {food.macroType}
                          </span>
                          <span>{food.calories} kcal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {mealDetail.notes && (
                <div className="bg-blue-50 p-3 rounded-lg text-blue-900 font-medium">
                  📝 Ghi chú: {mealDetail.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredClients.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
          <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-500 mb-2">
            Không tìm thấy học viên
          </h3>
          <p className="text-sm sm:text-base text-gray-400">
            Thử thay đổi từ khóa tìm kiếm
          </p>
        </div>
      )}

      {/* Popup xác nhận xóa workout plan */}
      {showDeleteWorkoutPopup && workoutPlanToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 text-red-600 rounded-full p-4 mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Xóa bài tập?
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa bài tập{" "}
                <span className="font-semibold">
                  {workoutPlanToDelete.name}
                </span>
                ?<br />
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex w-full gap-4">
                <button
                  onClick={() => {
                    setShowDeleteWorkoutPopup(false);
                    setWorkoutPlanToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    deleteWorkoutPlan(workoutPlanToDelete.id);
                    setShowDeleteWorkoutPopup(false);
                    setWorkoutPlanToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-fitness-red to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup xác nhận xóa meal plan */}
      {showDeleteMealPopup && mealPlanToDelete && (
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
                Bạn có chắc chắn muốn xóa meal plan
                <span className="font-semibold"> {mealPlanToDelete.name}</span>?
                <br />
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex w-full gap-4">
                <button
                  onClick={() => {
                    setShowDeleteMealPopup(false);
                    setMealPlanToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    deleteMealPlan(mealPlanToDelete.id);
                    setShowDeleteMealPopup(false);
                    setMealPlanToDelete(null);
                  }}
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

export default ClientInfo;
