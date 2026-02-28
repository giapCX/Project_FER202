import { useAppContext } from "../provider/AppProvider";

export const useForms = () => {
  const { forms, setForms } = useAppContext();

  const getFormsByDepartment = (departmentId) =>
    forms.filter(f => f.allowedDepartmentsId.includes(departmentId));

  return { forms, setForms, getFormsByDepartment };
};
