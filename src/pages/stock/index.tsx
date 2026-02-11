import { Button  } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { useAppStore } from "@/store/appStore";
import { useEffect } from "react";
import axios from "axios";

const API_URL = 'http://localhost:3001/items';

export function Stock() {
    const { setField, name, description, stockList } = useAppStore();

  // Carregar itens ao iniciar
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(API_URL);
      setField('stockList', response.data);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post(API_URL, {
        name,
        description,
      });
      setField('stockList', [...stockList, response.data]);
      setField('name', '');
      setField('description', '');
    } catch (error) {
      console.error('Erro ao cadastrar item:', error);
    }
  };

  const handleRemoveItem = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      const updatedList = stockList.filter(item => item.id !== id);
      setField('stockList', updatedList);
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  return (
    <>
     <div className="w-full h-screen bg-gray-300 p-6 flex gap-4">
        <h1 className="text-3xl font-bold mb-6">Gerenciar Estoque</h1>
      <FieldGroup className="w-1/2  bg-gray-100 p-6 rounded-lg shadow-md">
          <FieldSet>
            <FieldLegend>Cadastrar peça</FieldLegend>
            <FieldDescription className="text-gray-800">
              Formulário de cadastro de peças
            </FieldDescription>
            <Field className="mt-4">
              <FieldLabel htmlFor="name">Nome da peça</FieldLabel>
              <Input id="name" placeholder="Digite o nome da peça" value={name} onChange={(e) => setField('name', e.target.value)} />
            </Field>
            <Field className="mt-4">
              <FieldLabel htmlFor="description">Descrição</FieldLabel>
              <Input id="description" placeholder="Digite a descrição da peça" value={description} onChange={(e) => setField('description', e.target.value)} />
            </Field>
            <Button variant="default" onClick={handleRegister}>Cadastrar</Button>
          </FieldSet>
      </FieldGroup>
      <div className="w-1/2 bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Lista de Peças</h2>
        {stockList.length === 0 ? (
          <p className="text-gray-500">Nenhuma peça cadastrada ainda</p>
        ) : (
          <ul>
            {stockList.map((item) => (
              <li key={item.id} className="border-b py-2 flex justify-between items-center">
                <div>
                  <strong>{item.name}</strong>: {item.description}
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(item.id)}>
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
     </div>
    </>
  )
}