declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": any;
        }
    }
}
const ModelViewer: React.FC<{
    src: string;
}> = ({ src }) => (
    <model-viewer
        src={src}
        className={"singleAssetModel"}
        style={{width:"100%", height:"100%", background:"#fff"}}
        alt="A 3D model of an astronaut"
        auto-rotate
        camera-controls
    />
);

export default ModelViewer;
