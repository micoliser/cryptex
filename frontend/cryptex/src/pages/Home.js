import SearchBar from "../components/SearchBar";
import MainCard from "../components/MainCard";
import AssetList from "../components/AssetList";

const HomePage = () => (
  <div className="row h-100">
    <div className="col-md-7 p-4">
      <SearchBar />
      <MainCard />
    </div>
    <div className="col-12 col-md-3 p-4">
      <AssetList />
    </div>
  </div>
);

export default HomePage;
