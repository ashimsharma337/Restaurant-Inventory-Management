import Button from './Button';

const ComingSoon = ({ title }) => (
  <main style={{ padding: '2rem' }}>
    <h1>{title}</h1>
    <p>This area is reserved for the next workflow and still needs to be implemented.</p>
    <Button href="/dashboard" variant="secondary" icon="arrow_back">
      Back to dashboard
    </Button>
  </main>
);

export default ComingSoon;