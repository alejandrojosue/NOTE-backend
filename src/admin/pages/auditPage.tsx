import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Typography,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Pagination,
  PreviousLink,
  NextLink,
  PageLink,
} from '@strapi/design-system';
import styled from 'styled-components';

const Header = styled(Flex)`
  padding: 5rem 5.5rem;
  align-items: center;
  justify-content: space-between;
  height: 144px;
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FiltersBox = styled(Box)`
  background: white;
  border: 1px solid #eaeaef;
  border-radius: 8px;
  padding: 2rem;
  margin: 2rem 5.5rem 0rem;
  display: flex;
  gap: 3rem;
  flex-wrap: wrap;
`;

const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #dcdce4;
  border-radius: 6px;
  font-size: 1.3rem;
`;

const Button = styled.button`
  background: #4945ff;
  border: solid 1px #4945ff;
  color: white;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover {
    background: #3732cc;
  }
`;

const AuditoriasPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const TOKEN = import.meta.env.VITE_AUDIT_TOKEN || '020f39ccb70660eb1812ee5f842b0dccff501dce0e2681e3d91812941acb73fbe9e72ab2426cde7ede30c49d4c7058617b1ad3a1515f3d232e45101282f772808e9b2439773e4600f3b49255097de6cde28f66cb53f310f256f75e7e5fe7aba9d3c81c548b0e1ad5d36201f8bd9dbf87ea6cf5d300d4eaf5e4f9974d781eedeb';
  const formatDateTime = (value: string) => {
    // Convertimos el valor local a formato ISO sin zona horaria
    const date = new Date(value);
    return date.toISOString();
  };
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('pagination[page]', page.toString());
      params.append('pagination[pageSize]', pageSize.toString());
      params.append('sort[0]', 'id:desc');
      if (fromDate) params.append('filters[createdAt][$gte]', formatDateTime(fromDate));
      if (toDate) params.append('filters[createdAt][$lte]', formatDateTime(toDate));

      const res = await fetch(
        `${ 'http://localhost:1337'}/api/audits?${params.toString()}`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      const json = await res.json();
      setLogs(json.data || []);
      setTotal(json.meta?.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, fromDate, toDate]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Box background="neutral100" minHeight="100vh">
      {/* Header */}
      <Header>
        <TitleGroup>
          <Flex gap={2} alignItems="center">
            <Typography fontWeight="bold" textColor="neutral800" variant="alpha" fontSize={"3.2rem"}>
              Auditoría del sistema
            </Typography>
          </Flex>
          <Typography textColor="neutral600" variant="omega" fontSize={"1.6rem"}>
            Registros automáticos de inserciones, actualizaciones y eliminaciones.
          </Typography>
        </TitleGroup>
      </Header>

      {/* Filtros */}
      <FiltersBox>
        <div>
          <Typography textColor="neutral600" variant="omega">Desde</Typography>&nbsp;
          <Input
            type="datetime-local"
            value={fromDate}
            onChange={(e) => {
              setPage(1);
              setFromDate(e.target.value);
            }}
          />
        </div>
        <div>
          <Typography textColor="neutral600" variant="omega">Hasta</Typography>&nbsp;
          <Input
            type="datetime-local"
            value={toDate}
            onChange={(e) => {
              setPage(1);
              setToDate(e.target.value);
            }}
          />
        </div>
        <Button onClick={() => { setFromDate(''); setToDate(''); }} style={{padding: '0.5rem 1.5rem', fontSize: '1.3rem'}}>
          Limpiar filtros
        </Button>
      </FiltersBox>

      {/* Tabla */}
      <Box padding="5.5rem" paddingTop={"2rem"}>
        <Table colCount={6} rowCount={logs.length}>
          <Thead>
            <Tr>
              <Th><Typography variant="sigma">ID</Typography></Th>
              <Th><Typography variant="sigma">Tabla</Typography></Th>
              <Th><Typography variant="sigma">Usuario</Typography></Th>
              <Th><Typography variant="sigma">Acción</Typography></Th>
              <Th><Typography variant="sigma">Fecha</Typography></Th>
              <Th><Typography variant="sigma">Descripción</Typography></Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr><Td colSpan={6}  style={{ textAlign: 'center', padding: 25 }}><Typography textColor="neutral600" variant="omega">Cargando...</Typography></Td></Tr>
            ) : logs.length === 0 ? (
              <Tr><Td colSpan={6}  style={{ textAlign: 'center', padding: 25 }}><Typography textColor="neutral600" variant="omega">No hay registros.</Typography></Td></Tr>
            ) : (
              logs.map((log: any) => (
                <Tr key={log.id}>
                  <Td><Typography>{log.id}</Typography></Td>
                  <Td><Typography>{log.table_name}</Typography></Td>
                  <Td><Typography>{log.username || '-'}</Typography></Td>
                  <Td>
                    <Typography
                      style={{
                        color:
                          log.action === 'POST'
                            ? '#2ecc71'
                            : log.action === 'PUT'
                            ? '#3498db'
                            : log.action === 'DELETE'
                            ? '#e74c3c'
                            : '#666687',
                        fontWeight: 600,
                      }}
                    >
                      {log.action}
                    </Typography>
                  </Td>
                  <Td>
                    <Typography>
                      {new Date(log.createdAt).toLocaleString()}
                    </Typography>
                  </Td>
                  <Td><Typography>{log.description}</Typography></Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>

        {/* Paginación */}
        <Flex justifyContent="center" marginTop="1rem">
          <Pagination activePage={page} pageCount={totalPages}>
            <PreviousLink onClick={() => setPage((p) => Math.max(p - 1, 1))}>Anterior</PreviousLink>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PageLink
                key={i}
                number={i + 1}
                onClick={() => setPage(i + 1)}
                aria-current={i + 1 === page ? 'page' : undefined}
              >
                {i + 1}
              </PageLink>
            ))}
            <NextLink onClick={() => setPage((p) => Math.min(p + 1, totalPages))}>
              Siguiente
            </NextLink>
          </Pagination>
        </Flex>
      </Box>
    </Box>
  );
};

export default AuditoriasPage;
