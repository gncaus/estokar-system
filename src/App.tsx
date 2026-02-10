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
import { useAppStore } from "./store/appStore";
import { useEffect } from "react";
function App() {
  const { setField, name, description, stockList } = useAppStore();

  useEffect(() => {
  const storedList = localStorage.getItem('stockList');
  if (storedList) {
    setField('stockList', JSON.parse(storedList));
  }
}, []);

  const handleRegister = () => {
    const newItem = {
      id: Date.now(),
      name,
      description,
    };
    setField('stockList', [...stockList, newItem]);
    localStorage.setItem('stockList', JSON.stringify([...stockList, newItem]));
    setField('name', '');
    setField('description', '');
  }

  const handleRemoveItem = (id: number) => {
    const updatedList = stockList.filter(item => item.id !== id);
    localStorage.setItem('stockList', JSON.stringify(updatedList));
    setField('stockList', updatedList);
  }

  return (
    <>
     <div className="w-full h-screen bg-gray-300 p-6 flex gap-4">
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
            <Button variant="default" onClick={() => handleRegister()}>Cadastrar</Button>
          </FieldSet>
      </FieldGroup>
      <div className="w-1/2 bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Lista de Peças</h2>
        <ul>
          {stockList.map((item) => (
            <li key={item.id} className="border-b py-2">
              <strong>{item.name}</strong>: {item.description}
              <Button variant="destructive" onClick={() => handleRemoveItem(item.id)}>Remover</Button>
            </li>
          ))}
        </ul>
      </div>
     </div>
    </>
  )
}

export default App
