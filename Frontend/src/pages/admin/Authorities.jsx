import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getAuthorities,
  createAuthority,
  updateAuthority,
  deleteAuthority,
} from "../../services/authorityService.js";

const Authorities = () => {
  //States
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    shortName: "",
    type: "",
    description: "",
  });
  const [error, setError] = useState(null);

  //Functions
  const fetchAuthorities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAuthorities();

      if (response.data.success) {
        setAuthorities(response.data.authorities);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load authorities.");

      toast.error(
        error.response?.data?.message || "Failed to load authorities.",
      );
    } finally {
      setLoading(false);
    }
  };

  //useEffect
  useEffect(() => {
    fetchAuthorities();
  }, []);

  //Form Submit Handler (Creates or Updates)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      //if ID exists, then do this by just updating
      if (editingId) {
        const response = await updateAuthority(editingId, formData);
        if (response.data.success) {
          toast.data.message;
          setEditingId(null);
        }
      }

      //if ID don't exists, then do create new one
      else {
        const response = await createAuthority(formData);
        if (response.data.success) {
          toast.data.message;
        }
      }

      //Reset Form State & Refresh List
      setFormData({
        id: "",
        name: "",
        shortName: "",
        type: "",
        description: "",
      });

      fetchAuthorities();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save authority.";
      toast.error.message;
    } finally {
      setLoading(false);
    }
  };

  //Populate form with existing data to Edit
  const handleEditClick = (authority) => {
    setEditingId(authority._id);
    setFormData({
      id: authority.id || "",
      name: authority.name || "",
      shortName: authority.shortName || "",
      type: authority.type || "",
      description: authority.description || "",
    });
  };

  //for the form and input
  const fields = [
    { label: "ID", name: "id" },
    { label: "Name", name: "name" },
    { label: "Short Name", name: "shortName" },
    { label: "Type", name: "type" },
    { label: "Description", name: "description" },
  ];
  //Return
  return (
    <div>
      <h1>Authorities</h1>
      <form>
        {fields.map(({ label, name }) => (
          <div key={name}>
            <label>{label}</label>

            <input
              type="text"
              value={formData[name]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [name]: e.target.value,
                })
              }
            />
          </div>
        ))}
      </form>

      {authorities.map((authority) => (
        <div key={authority._id}>
          <h1>{authority.name}</h1>

          <p>{authority.shortName}</p>

          <p>{authority.type}</p>

          <hr />
        </div>
      ))}
    </div>
  );
};

export default Authorities;
