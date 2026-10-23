/** Sticky section index that rides along the left edge of a section. */
export default function Label({ num, text }) {
  return (
    <div className="section__label-wrap" aria-hidden="true">
      <span className="section__label label">
        <b>{num}</b> {text}
      </span>
    </div>
  )
}
