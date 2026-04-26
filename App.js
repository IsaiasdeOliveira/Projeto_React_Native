import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity 
} from 'react-native';

export default function App() {
  // Estados para gerenciar os dados e a interface
  const [dados, setDados] = useState([]);
  const [dadosFiltrados, setDadosFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  
  // Estados para as interações do usuário
  const [minMag, setMinMag] = useState('5'); 
  const [buscaLocal, setBuscaLocal] = useState(''); 

  // IA: usei para entender a estrutura do fetch assíncrono e como acessar a chave 'features'
  async function buscarTerremotos (){
    
    try {
      setCarregando(true);
      setErro(null);
      
      // IA: usei para entender como estruturar o fetch dinâmico e tratar erros [cite: 17]
      const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2023-03-01&endtime=2023-03-02&minmagnitude=${minMag}`;
      const resposta = await fetch(url);
      const json = await resposta.json();
      
      setDados(json.features); 
      setDadosFiltrados(json.features);
      setBuscaLocal(''); // Limpa a busca por local ao carregar novos dados
    } catch (e) {
      setErro('Não foi possível conectar com o catálogo de terremotos.');
    } finally {
      setCarregando(false);
    }
  };

  // Função para filtrar a lista localmente por nome do lugar
  const filtrarPorLocal = (texto) => {
    setBuscaLocal(texto);
    const filtrados = dados.filter(item => 
      item.properties.place.toLowerCase().includes(texto.toLowerCase())
    );
    setDadosFiltrados(filtrados);
  };

  // useEffect para carregar os dados na primeira vez 
  useEffect(() => {
    buscarTerremotos();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Monitor de Terremotos</Text>
      
       {/* iteração do usúario */}
      <View style={styles.areaFiltro}>
        <Text style={styles.label}>Magnitude Mínima:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={minMag}
          onChangeText={setMinMag}
          placeholder="Ex: 5"
        />
       {/* usei a documentação para entender como usa TouchableOpacity */}
        <TouchableOpacity style={styles.botao} onPress={buscarTerremotos}>
          <Text style={styles.textoBotao}>Consultar API</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Filtrar por local na lista..."
          value={buscaLocal}
          onChangeText={filtrarPorLocal}
        />
      </View>

      {carregando ? (
        <View style={styles.centralizado}>
          <ActivityIndicator size="large" color="#e74c3c" />
          <Text>Buscando dados geológicos...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centralizado}>
          <Text style={styles.textoErro}>{erro}</Text>
          <TouchableOpacity style={styles.botao} onPress={buscarTerremotos}>
            <Text style={styles.textoBotao}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        //IA: usei pra entender como funciona o FlatList com renderItem
        <FlatList
          data={dadosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cartao}>
              <View style={styles.headerCartao}>
                <Text style={styles.magnitude}>M {item.properties.mag}</Text>
                <Text style={styles.tipo}>{item.properties.type}</Text>
              </View>
              <Text style={styles.local}>{item.properties.place}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum terremoto encontrado.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0', paddingHorizontal: 15 },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#2c3e50' },
  areaFiltro: { marginBottom: 15 },
  label: { fontSize: 14, color: '#7f8c8d', marginBottom: 5 },
  input: {
    backgroundColor: '#fff',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#dcdde1',
    marginBottom: 10,
  },
  botao: {
    backgroundColor: '#2980b9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  textoBotao: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  centralizado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cartao: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  headerCartao: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  magnitude: { fontSize: 18, fontWeight: 'bold', color: '#e74c3c' },
  tipo: { fontSize: 12, color: '#95a5a6', textTransform: 'uppercase' },
  local: { fontSize: 16, color: '#34495e' },
  textoErro: { color: '#c0392b', marginBottom: 20, textAlign: 'center' },
  vazio: { textAlign: 'center', marginTop: 20, color: '#7f8c8d' }
});