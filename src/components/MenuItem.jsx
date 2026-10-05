const MenuItem = (props) => {
  return (
    <div className="food-card">
      {props.image && (
        <img className="food-image" src={props.image} alt={props.name} />
      )}

      <div className="food-card-content">
        <div className="food-name-price">
          <h3>{props.name}</h3>
          <p className="food-price">{Number(props.price).toFixed(2)} €</p>
        </div>

        {props.description && (
          <p className="food-description">{props.description}</p>
        )}

        <div className="food-badges">
          {props.type && <span className="type-badge">{props.type}</span>}

          {props.diet && <span className="diet-badge">{props.diet}</span>}
        </div>

        <button className="details-button" onClick={props.viewDetails}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default MenuItem;
