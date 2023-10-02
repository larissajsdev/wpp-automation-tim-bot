import Navbar from "../components/Navbar";
export interface Props extends React.HTMLProps<HTMLDivElement> {}
export default function layout(props: Props) {
  return (
    <>
      <Navbar />
      <div>{props.children}</div>
    </>
  );
}
