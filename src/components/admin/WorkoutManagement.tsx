import React, { useState } from "react";
import { useData } from "../../contexts/DataContext";
import {
  Plus,
  Edit,
  Trash2,
  User,
  Calendar,
  Dumbbell,
  X,
  List,
  Copy,
} from "lucide-react";

const WorkoutManagement: React.FC = () => {
  const {
    workoutPlans,
    addWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
    duplicateWorkoutPlan,
  } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState("");
  const [planName, setPlanName] = useState("");
  const [days, setDays] = useState([
    { day: "Thứ 2", isRestDay: false, exercises: [] },
    { day: "Thứ 3", isRestDay: false, exercises: [] },
    { day: "Thứ 4", isRestDay: true, exercises: [] },
    { day: "Thứ 5", isRestDay: false, exercises: [] },
    { day: "Thứ 6", isRestDay: false, exercises: [] },
    { day: "Thứ 7", isRestDay: false, exercises: [] },
    { day: "Chủ nhật", isRestDay: true, exercises: [] },
  ]);
  const [showWeeksModal, setShowWeeksModal] = useState(false);
  const [weeksClient, setWeeksClient] = useState<{
    clientId: string;
    plans: any[];
  } | null>(null);

  // Duplicate feature state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [planToDuplicate, setPlanToDuplicate] = useState<any>(null);
  const [duplicateClientId, setDuplicateClientId] = useState("");

  // Popup xác nhận xóa bài tập
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<any>(null);

  const clients = JSON.parse(localStorage.getItem("pt_users") || "[]").filter(
    (u: any) => u.role === "client"
  );

  // Chỉ hiển thị tuần đầu tiên hoặc tuần do admin tạo cho mỗi client
  const getPlansForDisplay = () => {
    // Lấy tuần đầu tiên hoặc tuần có createdBy: "admin" cho mỗi client
    const plansShown: any[] = [];
    const clientIds: string[] = [];
    workoutPlans.forEach((plan) => {
      if (
        !clientIds.includes(plan.clientId) &&
        (plan.weekNumber === 1 || plan.createdBy === "admin")
      ) {
        plansShown.push(plan);
        clientIds.push(plan.clientId);
      }
    });
    return plansShown;
  };

  const plansForDisplay = getPlansForDisplay();

  const handleShowWeeks = (clientId: string) => {
    // Lấy tất cả các tuần của client đó
    const plans = workoutPlans
      .filter((p) => p.clientId === clientId)
      .sort((a, b) => a.weekNumber - b.weekNumber);
    setWeeksClient({ clientId, plans });
    setShowWeeksModal(true);
  };

  // Duplicate logic
  const handleDuplicate = (plan: any) => {
    setPlanToDuplicate(plan);
    setDuplicateClientId("");
    setShowDuplicateModal(true);
  };
  const confirmDuplicate = () => {
    if (!planToDuplicate || !duplicateClientId) return;
    duplicateWorkoutPlan(planToDuplicate.id, duplicateClientId);
    setShowDuplicateModal(false);
    setPlanToDuplicate(null);
    setDuplicateClientId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const planData = {
      id: editingPlan?.id || `plan-${Date.now()}`,
      name: planName,
      clientId: selectedClient,
      weekNumber: 1,
      startDate: new Date().toISOString().split("T")[0],
      days,
      createdBy: "admin",
    };
    if (editingPlan) {
      updateWorkoutPlan(editingPlan.id, planData);
    } else {
      addWorkoutPlan(planData);
    }
    resetForm();
  };

  const resetForm = () => {
    setSelectedClient("");
    setPlanName("");
    setDays([
      { day: "Thứ 2", isRestDay: false, exercises: [] },
      { day: "Thứ 3", isRestDay: false, exercises: [] },
      { day: "Thứ 4", isRestDay: true, exercises: [] },
      { day: "Thứ 5", isRestDay: false, exercises: [] },
      { day: "Thứ 6", isRestDay: false, exercises: [] },
      { day: "Thứ 7", isRestDay: false, exercises: [] },
      { day: "Chủ nhật", isRestDay: true, exercises: [] },
    ]);
    setEditingPlan(null);
    setShowForm(false);
  };

  // Các hàm cho CRUD bài tập bên trong ngày
  const addExercise = (dayIndex: number) => {
    const newExercise = {
      id: `exercise-${Date.now()}`,
      name: "",
      sets: [{ set: 1, reps: 10, reality: 10, weight: 0, volume: 0 }],
    };
    const newDays = [...days];
    newDays[dayIndex].exercises.push(newExercise);
    setDays(newDays);
  };
  const updateExercise = (
    dayIndex: number,
    exerciseIndex: number,
    field: string,
    value: any
  ) => {
    const newDays = [...days];
    newDays[dayIndex].exercises[exerciseIndex][field] = value;
    setDays(newDays);
  };
  const addSet = (dayIndex: number, exerciseIndex: number) => {
    const newDays = [...days];
    const currentSets = newDays[dayIndex].exercises[exerciseIndex].sets;
    const newSetNumber = currentSets.length + 1;
    if (newSetNumber <= 4) {
      currentSets.push({
        set: newSetNumber,
        reps: 10,
        reality: 10,
        weight: 0,
        volume: 0,
      });
      setDays(newDays);
    }
  };
  const removeSet = (
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number
  ) => {
    const newDays = [...days];
    newDays[dayIndex].exercises[exerciseIndex].sets.splice(setIndex, 1);
    newDays[dayIndex].exercises[exerciseIndex].sets.forEach((set, idx) => {
      set.set = idx + 1;
    });
    setDays(newDays);
  };
  const updateSet = (
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: number
  ) => {
    const newDays = [...days];
    newDays[dayIndex].exercises[exerciseIndex].sets[setIndex][field] = value;
    setDays(newDays);
  };
  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].exercises.splice(exerciseIndex, 1);
    setDays(newDays);
  };
  const toggleRestDay = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].isRestDay = !newDays[dayIndex].isRestDay;
    if (newDays[dayIndex].isRestDay) {
      newDays[dayIndex].exercises = [];
    }
    setDays(newDays);
  };
  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setSelectedClient(plan.clientId);
    setPlanName(plan.name);
    setDays(plan.days);
    setShowForm(true);
  };
  const getClientName = (clientId: string) => {
    const client = clients.find((c: any) => c.id === clientId);
    return client?.fullName || "Không tìm thấy";
  };

  // Popup xác nhận xóa bài tập
  const openDeletePopup = (plan: any) => {
    setPlanToDelete(plan);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    if (planToDelete) {
      deleteWorkoutPlan(planToDelete.id);
    }
    setShowDeletePopup(false);
    setPlanToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setPlanToDelete(null);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-fitness-black">
            Quản lý giáo án
          </h2>
          <p className="text-gray-600 mt-1">
            Tạo và quản lý bài tập cho học viên
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-fitness-red to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Tạo giáo án</span>
        </button>
      </div>

      {/* Workout Plans List */}
      <div className="grid gap-6 mb-6">
        {plansForDisplay.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-fitness-black text-xl">
                    {plan.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{getClientName(plan.clientId)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Tuần {plan.weekNumber}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Dumbbell className="h-4 w-4" />
                      <span>
                        {plan.days.filter((d) => !d.isRestDay).length} ngày tập
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openDeletePopup(plan)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleShowWeeks(plan.clientId)}
                    className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <List className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(plan)}
                    className="p-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-110"
                    title="Duplicate giáo án"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 mt-4">
                {plan.days.map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-center text-sm ${
                      day.isRestDay
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    <div className="font-medium">{day.day}</div>
                    <div>
                      {day.isRestDay ? "Nghỉ" : `${day.exercises.length} bài`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirm Popup */}
      {showDeletePopup && planToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 text-red-600 rounded-full p-4 mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Xóa giáo án?
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa giáo án{" "}
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

      {/* Weeks Modal (Xem các tuần của 1 khách hàng) */}
      {showWeeksModal && weeksClient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-xl font-bold text-fitness-black">
                Các tuần của {getClientName(weeksClient.clientId)}
              </h3>
              <button
                onClick={() => setShowWeeksModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              {weeksClient.plans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <div className="font-semibold text-fitness-black">
                        {plan.name} (Tuần {plan.weekNumber})
                      </div>
                      <div className="text-gray-600 text-sm">
                        Ngày bắt đầu:{" "}
                        {new Date(plan.startDate).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        {plan.days.filter((d) => !d.isRestDay).length} ngày tập
                      </span>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                        {plan.days.filter((d) => d.isRestDay).length} ngày nghỉ
                      </span>
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                        {plan.createdBy === "admin"
                          ? "Tạo bởi admin"
                          : "Tạo bởi client"}
                      </span>
                    </div>
                  </div>
                  {/* Có thể bổ sung nút xem chi tiết bài tập từng tuần ở đây nếu cần */}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-fitness-black">
                Duplicate giáo án
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
                Chọn học viên để gán giáo án này:
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

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-fitness-black">
                  {editingPlan ? "✏️ Chỉnh sửa giáo án" : "🏋️ Tạo giáo án mới"}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên giáo án
                    </label>
                    <input
                      type="text"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200"
                      placeholder="VD: Giáo án tăng cơ, giảm cân..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Học viên
                    </label>
                    <select
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200"
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

                {/* Days Configuration */}
                <div className="space-y-8">
                  {days.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="border border-gray-200 rounded-xl p-6 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-semibold text-fitness-black">
                          {day.day}
                        </h4>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={day.isRestDay}
                              onChange={() => toggleRestDay(dayIndex)}
                              className="rounded border-gray-300 text-fitness-red focus:ring-fitness-red"
                            />
                            <span className="text-sm text-gray-600">
                              Ngày nghỉ
                            </span>
                          </label>
                          {!day.isRestDay && (
                            <button
                              type="button"
                              onClick={() => addExercise(dayIndex)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                              Thêm bài tập
                            </button>
                          )}
                        </div>
                      </div>
                      {!day.isRestDay && (
                        <div className="space-y-6">
                          {day.exercises.map((exercise, exerciseIndex) => (
                            <div
                              key={exerciseIndex}
                              className="bg-white rounded-lg p-6 border border-gray-200"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <input
                                  type="text"
                                  value={exercise.name}
                                  onChange={(e) =>
                                    updateExercise(
                                      dayIndex,
                                      exerciseIndex,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="text-lg font-medium bg-transparent border-none outline-none focus:bg-gray-50 focus:border focus:border-gray-300 rounded px-3 py-2 flex-1"
                                  placeholder="Tên bài tập"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeExercise(dayIndex, exerciseIndex)
                                  }
                                  className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors ml-4"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                              <div className="space-y-3">
                                <div className="grid grid-cols-5 gap-3 text-sm font-medium text-gray-600 px-3">
                                  <div>Set</div>
                                  <div>Reps</div>
                                  <div>Reality</div>
                                  <div>Weight (kg)</div>
                                  <div>Action</div>
                                </div>
                                {exercise.sets.map((set, setIndex) => (
                                  <div
                                    key={setIndex}
                                    className="grid grid-cols-5 gap-3 items-center"
                                  >
                                    <div className="text-center font-medium">
                                      Set {set.set}
                                    </div>
                                    <input
                                      type="number"
                                      min="1"
                                      value={set.reps}
                                      onChange={(e) =>
                                        updateSet(
                                          dayIndex,
                                          exerciseIndex,
                                          setIndex,
                                          "reps",
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      className="px-3 py-2 border border-gray-300 rounded-lg text-center"
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      value={set.reality}
                                      onChange={(e) =>
                                        updateSet(
                                          dayIndex,
                                          exerciseIndex,
                                          setIndex,
                                          "reality",
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      className="px-3 py-2 border border-gray-300 rounded-lg text-center"
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      value={set.weight}
                                      onChange={(e) =>
                                        updateSet(
                                          dayIndex,
                                          exerciseIndex,
                                          setIndex,
                                          "weight",
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="px-3 py-2 border border-gray-300 rounded-lg text-center"
                                    />
                                    <div className="flex space-x-2">
                                      {exercise.sets.length < 4 &&
                                        setIndex ===
                                          exercise.sets.length - 1 && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              addSet(dayIndex, exerciseIndex)
                                            }
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
                                          >
                                            +
                                          </button>
                                        )}
                                      {exercise.sets.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeSet(
                                              dayIndex,
                                              exerciseIndex,
                                              setIndex
                                            )
                                          }
                                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                                        >
                                          -
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {day.isRestDay && (
                        <div className="text-center py-12 text-gray-500">
                          <span className="text-4xl">🛌</span>
                          <p className="text-lg mt-2">Ngày nghỉ</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-fitness-red to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                  >
                    {editingPlan ? "Cập nhật" : "Tạo giáo án"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutManagement;
